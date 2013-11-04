/* global angular, console */

'use strict';

angular.module('angular-google-analytics', [])
    .provider('Analytics', function() {
        var created = false,
            trackRoutes = true,
            accountId,
            trackPrefix = '',
            domainName;

          this._logs = [];

          // config methods
          this.setAccount = function(id) {
              accountId = id;
              return true;
          };
          this.trackPages = function(doTrack) {
              trackRoutes = doTrack;
              return true;
          };
          this.trackPrefix = function(prefix) {
              trackPrefix = prefix;
              return true;
          };

          this.setDomainName = function(domain) {
            domainName = domain;
            return true;
          };

        // public service
        this.$get = ['$document', '$rootScope', '$location', '$window', function($document, $rootScope, $location, $window) {
          // private methods
          function _createScriptTag() {
            // inject the google analytics tag
            if (!accountId) return;
            $window._gaq = [];
            $window._gaq.push(['_setAccount', accountId]);
            if (trackRoutes) $window._gaq.push(['_trackPageview']);
            if(domainName) $window._gaq.push(['_setDomainName', domainName]);
            (function() {
              var document = $document[0];
              var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
              ga.src = ('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
              var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
            })();
            created = true;
          }
          this._log = function() {
            // for testing
            this._logs.push(arguments);
          };
          this._trackPage = function(url) {
            if (trackRoutes && $window._gaq) {
              $window._gaq.push(['_trackPageview', trackPrefix + url]);
              this._log('_trackPageview', arguments);
            }
          };
          this._trackEvent = function(category, action, label, value) {
            if ($window._gaq) {
              $window._gaq.push(['_trackEvent', category, action, label, value]);
              this._log('trackEvent', arguments);
            }
          };

          /**
           * Add transaction
           * https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEcommerce#_gat.GA_Tracker_._addTrans
           * @param transactionId
           * @param affiliation
           * @param total
           * @param tax
           * @param shipping
           * @param city
           * @param state
           * @param country
           * @private
           */
          this._addTrans = function (transactionId, affiliation, total, tax, shipping, city, state, country) {
            if ($window._gaq) {
              $window._gaq.push(['_addTrans', transactionId, affiliation, total, tax, shipping, city, state, country]);
              this._log('_addTrans', arguments);
            }
          };

          /**
           * Add item to transaction
           * https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEcommerce#_gat.GA_Tracker_._addItem
           * @param transactionId
           * @param sku
           * @param name
           * @param category
           * @param price
           * @param quantity
           * @private
           */
          this._addItem = function (transactionId, sku, name, category, price, quantity) {
            if ($window._gaq) {
              $window._gaq.push(['_addItem', transactionId, sku, name, category, price, quantity]);
              this._log('_addItem', arguments);
            }
          };

          /**
           * Track transaction
           * https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEcommerce#_gat.GA_Tracker_._trackTrans
           * @private
           */
          this._trackTrans = function () {
            if ($window._gaq) {
              $window._gaq.push(['_trackTrans']);
            }
            this._log('_trackTrans', arguments);
          };

           /**
            * Set custom variable
            * @param index The slot for the custom variable. Required. This is a number whose value can range from 1 - 5, inclusive. A custom variable should be placed in one slot only and not be re-used across different slots.
            * @param name The name for the custom variable. Required. This is a string that identifies the custom variable and appears in the top-level Custom Variables report of the Analytics reports.
            * @param value The value for the custom variable. Required. This is a string that is paired with a name. You can pair a number of values with a custom variable name. The value appears in the table list of the UI for a selected variable name. Typically, you will have two or more values for a given name. For example, you might define a custom variable name gender and supply male and female as two possible values.
            * @param opt_scope The scope for the custom variable. Optional. As described above, the scope defines the level of user engagement with your site. It is a number whose possible values are 1 (visitor-level), 2 (session-level), or 3 (page-level). When left undefined, the custom variable scope defaults to page-level interaction.
            */
            this._setCustomVar = function(index, name, value, opt_scope) {
                if ($window._gaq) {
                  $window._gaq.push(['_setCustomVar', index, name, value, opt_scope]);
                }
                this._log('_setCustomVar', arguments);
            };

            // creates the ganalytics tracker
            _createScriptTag();

            var me = this;

            // activates page tracking
            if (trackRoutes) $rootScope.$on('$routeChangeSuccess', function() {
              me._trackPage($location.path());
            });

            return {
                _logs: me._logs,
                trackPage: function(url) {
                    // add a page event
                    me._trackPage(url);
                },
                trackEvent: function(category, action, label, value) {
                    // add an action event
                    me._trackEvent(category, action, label, value);
                },
                addTrans: function (transactionId, affiliation, total, tax, shipping, city, state, country) {
                    me._addTrans(transactionId, affiliation, total, tax, shipping, city, state, country);
                },
                addItem: function (transactionId, sku, name, category, price, quantity) {
                    me._addItem(transactionId, sku, name, category, price, quantity);
                },
                trackTrans: function () {
                    me._trackTrans();
                },
                setCustomVar: function (index, name, value, opt_scope) {
                    me._setCustomVar(index, name, value, opt_scope);
                }
            };
        }];

    });
