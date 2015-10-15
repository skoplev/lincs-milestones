/**
 * @author Michael McDermott
 * Created on 7/28/15.
 */

  angular
    .module('clustergram', [])
    .directive('clustergram', clustergramDir);

  function clustergramDir() {
    return {
      restrict: 'E',
      scope: {
        arguments: '='
      },
      templateUrl: 'clustergram.html',
      controller: ClustergramController,
      controllerAs: 'vm',
      bindToController: true
    };

    /* @ngInject */
    function ClustergramController($timeout, d3, d3Clust) {
      var vm = this;
      vm.setOrder = setOrder;
      vm.active = 'rank';
      var clustergram;

      function setOrder(orderString) {
        vm.active = orderString;
        if (clustergram) {
          clustergram.reorder(orderString);
        } else {
          clustergram = d3Clust.clustergram(vm.arguments);
          clustergram.reorder(orderString);
        }
      }

      function renderClust() {
        vm.arguments.order = vm.active;
        var winWidth = angular.element(window).width();
        var transpose = (winWidth < 992 && winWidth > 550);
        if (transpose) {
          vm.arguments.col_label_scale = 1.5;
        } else {
          vm.arguments.col_label_scale = 1.25;
        }
        if (!clustergram || vm.arguments.transpose !== transpose) {
          vm.arguments.transpose = transpose;
          clustergram = d3Clust.clustergram(vm.arguments);
        } else {
          var clustHeight = transpose === true ? 800 : 400;
          var clustWidth = transpose === true ? 550 : winWidth - 200;
          clustergram.resize(clustWidth, clustHeight, 0, 0);
        }

      }

      var runIt;
      angular.element(window).resize(function() {
        clearTimeout(runIt);
        runIt = setTimeout(renderClust(), 100);
      });

      function simulateClick() {
        d3.select('.tile').each(function(d, i) {
          d3.select(this).on('click').apply(this, [d, i]);
        });
      }

      renderClust();
      simulateClick();
    }
  }
