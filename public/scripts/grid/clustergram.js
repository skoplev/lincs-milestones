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
  function ClustergramController($timeout, lodash, d3, d3Clust) {
    var vm = this;
    vm.setOrder = setOrder;
    vm.active = 'rank';
    var clustergram;
    var clustColors = {
      'PromoCell Myocytes': '#5D4A66',
      'Cell Free': '#DAA49A',
    };
    var orangeGroup = ['L1000', 'RNA-Seq', 'ATAC-Seq'];
    var purpleGroup = ['GCP', 'P100', 'RPPA', 'SWATH-MS'];
    var darkGreenGroup = ['MEMA', 'Viability', 'Immunofluorescence']

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
      if (!clustergram) {
        clustergram = d3Clust.clustergram(vm.arguments);
      }

      d3.selectAll('.row_label_text').each(function(d, i) {
        var label = d3.select(this).text();
        d3.selectAll('.row_triangle_group').each(function(e, j) {
          var path = d3.select(this).select('path');
          if (i !== j) {
            return;
          }
          if (orangeGroup.indexOf(label) > -1) {
            path.style('fill', 'orange');
          } else if (purpleGroup.indexOf(label) > -1) {
            path.style('fill', 'purple');
          } else if (darkGreenGroup.indexOf(label) > -1) {
            path.style('fill', '#373F47');
          } else {
            path.style('fill', 'red')
          }
        });
      });

      d3.selectAll('.col_label_text').each(function(d, i) {
        var node = d3.select(this);
        var label = node.text();
        var path = node.select('path');
        if (lodash.has(clustColors, label)) {
          path.style('fill', clustColors[label]);
        } else if (label.split(' ')[0] === 'iPSC') {
          path.style('fill', '#008000');
        } else {
          path.style('fill', '#cc9');
        }
      });
    }

    function simulateClick() {
      d3.select('.tile').each(function(d, i) {
        d3.select(this).on('click').apply(this, [d, i]);
      });
    }

    renderClust();
    simulateClick();
  }
}
