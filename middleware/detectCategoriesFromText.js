var _ = require('lodash');
const searchService = require('../service/search');


/**
 * Utility for calculating query result size
 * incorporating padding for dedupe process
 */
function setup(esclient) {
  return function detectCategories(req, res, next) {
    if (_.isUndefined(req.clean) || _.isUndefined(req.clean.size)) {
      return next();
    }

    if(req.clean?.text?.length) {
      // lets check if the text is a category keyword!
      var fuzziness = 0;
      if(req.clean.text.length > 12) {
        fuzziness = 4
      } else if(req.clean.text.length > 9) {
        fuzziness = 3
      } else if(req.clean.text.length > 7) {
        fuzziness = 2
      } else if(req.clean.text.length > 5) {
        fuzziness = 1
      }
  
      const cat_cmd = {
        index: "categories",
        body: {
          query: {
            match: {
              keywords: {
                query: req.clean.text,
                fuzziness: fuzziness
              }
            }
          }
        }
      };
  
      searchService( esclient, cat_cmd, function( err, docs, meta, data ){
  
        // keep tally of hit counts - compatible with new/old versions of ES
        let totalHits = 0;
        if( _.has(data, 'hits.total') ) {
          totalHits = _.isPlainObject(data.hits.total) ? data.hits.total.value : data.hits.total;
        }
  
        if(totalHits > 0) {
          // yes!!! this is a category!
          var cats = [];
  
          for(var hit of data.hits.hits){
            cats.push(hit._id)
          }
  
          req.clean.categories_detected = cats;
        } else {

        }
        next();
      });
    } else {
      // TODO... better error response
      throw new Error("need text");
    }
  };
}

module.exports = setup;
