/*eslint camelcase: 0*/

angular
  .module('indexControllers', ['ngLodash', 'clustergram'])
  .controller('Docent3Controller', Docent3Controller);

/* @ngInject */
function Docent3Controller($window, $http, d3, d3Data, lodash) {

  var vm = this;
  var idx = window.location.href.lastIndexOf('/');
  vm.baseUrl = $window.location.href.slice(0, idx + 1);
  vm.search = search;
  vm.releases = [];
  vm.resultsLoading = false;
  vm.resultIsSearch = false;
  vm.tileCb = tileCb;
  vm.searchQ = '';
  vm.searchQCopy = '';
  vm.query = {
    dataset: '',
    cellLine: '',
    perturbagens: []
  };
  vm.arguments = {
    network_data: d3Data,
    svg_div_id: 'svg-div',
    row_label: 'Assays',
    col_label: 'Cell Lines',
    outer_margins: {
      'top': 'inherit',
      'bottom': 'inherit',
      'left': 'inherit',
      'right': 'inherit'
    },
    opacity_scale: 'log',
    // input_domain: 0.1,
    do_zoom: false,
    // tile_colors: ['#083F50', '#ED9124'],
    tile_colors: ['#3593b1', '#ED9124'],
    tile_click_hlight: true,
    highlight_color: 'yellow',
    title_tile: true,
    click_tile: tileCb,
    click_label: clickLabel,
    // 'click_group': click_group_callback
    resize: false,
    order: 'rank',
    zoom: false,
    super_font_size: '24px'
  };

  function clickLabel(label, rowCol) {
    vm.resultIsSearch = false;
    d3.selectAll('.highlight').style('opacity', 0);
    if (isTransposed()) {
      vm.query = {
        cellLine: rowCol === 'row' ? label : null,
        dataset: rowCol === 'col' ? label : null
      };
    } else {
      vm.query = {
        cellLine: rowCol === 'col' ? label : null,
        dataset: rowCol === 'row' ? label : null
      };
    }
    queryLDR();
  }

  function isTransposed() {
    var winWidth = angular.element(window).width();
    return (winWidth < 992 && winWidth > 768);
  }

  function tileCb(tileInfo) {
    d3.selectAll('.tile').each(function(d, i) {
      if (!lodash.isEqual(d, tileInfo)) {
        d3.select(this).selectAll('.highlight')
          .style('opacity', 0);
      }
    });
    vm.resultIsSearch = false;
    var pertIds = lodash.map(tileInfo.perts, function(pert) {
      return pert._id;
    });
    vm.query = {
      dataset: isTransposed() ? tileInfo.col : tileInfo.row,
      cellLine: isTransposed() ? tileInfo.row : tileInfo.col,
      perturbagens: pertIds.join(',')
    };
    queryLDR();
  }

  function getDatasetsWithPerts(input, callback) {
    $http({
      url: 'http://amp.pharm.mssm.edu/LDR/api/autocomplete/perturbagens',
      method: 'GET',
      params: {
        q: input
      }
    }).then(function(response) {
      var pertIds = [];
      lodash.each(response.data, function(obj) {
        if (obj._id) {
          pertIds.push(obj._id);
        }
      });
      $http({
        url: 'http://amp.pharm.mssm.edu/LDR/api/releases/filter',
        method: 'GET',
        params: {
          perturbagens: pertIds.join(',')
        }
      }).then(function(response) {
        var datasetsWithPerts = [];
        lodash.each(response.data, function(obj) {
          if (obj.released) {
            obj.releaseDates.upcoming = new Date(obj.releaseDates
              .upcoming);
            datasetsWithPerts.push(obj);
          }
        });
        callback(datasetsWithPerts);
      });
    });
  }

  function getDatasetsWithCLines(input, callback) {
    $http({
      url: 'http://amp.pharm.mssm.edu/LDR/api/releases/filter',
      method: 'GET',
      params: {
        cellLine: input
      }
    }).then(function(response) {
      var datasetsWithCLines = [];
      lodash.each(response.data, function(obj) {
        if (obj.released) {
          obj.releaseDates.upcoming = new Date(obj.releaseDates.upcoming);
          datasetsWithCLines.push(obj);
        }
      });
      callback(datasetsWithCLines);
    });
  }

  function getDatasets(input, callback) {
    $http({
      url: 'http://amp.pharm.mssm.edu/LDR/api/releases/search',
      method: 'GET',
      params: {
        q: input
      }
    }).then(function(response) {
      var datasets = [];
      lodash.each(response.data, function(obj) {
        if (obj.released) {
          obj.releaseDates.upcoming = new Date(obj.releaseDates.upcoming);
          datasets.push(obj);
        }
      });
      callback(datasets);
    });
  }

  function search() {
    if (!vm.searchQ.length) {
      return;
    }

    vm.resultIsSearch = true;
    vm.searchQCopy = vm.searchQ;

    d3.selectAll('.row_label_text').each(function(d, i) {
      var label = d3.select(this).text();
      if (vm.searchQ === label && !labelSelected) {
        d3.select(this).on('click').apply(this, [d, i]);
        return;
      }
    });

    d3.selectAll('.col_label_text').each(function(d, i) {
      var label = d3.select(this).text();
      if (vm.searchQ === label && !labelSelected) {
        d3.select(this).on('click').apply(this, [d, i]);
        return;
      }
    });

    vm.resultsLoading = true;

    getDatasetsWithPerts(vm.searchQ, function(dsWithPerts) {
      getDatasetsWithCLines(vm.searchQ, function(dsWithCLines) {
        getDatasets(vm.searchQ, function(datasets) {
          var concated = dsWithPerts.concat(dsWithCLines, datasets);
          vm.releases = lodash.uniq(concated, false, '_id');
          d3.selectAll('.click_hlight').style('opacity', 0);
          lodash.each(vm.releases, function(release) {
            var perts = release.metadata.perturbagens;
            var pertIds = lodash.map(perts, function(obj) {
              return obj._id;
            });
            d3.selectAll('.tile').each(function(d, i) {
              var that = this;
              lodash.each(d.info, function(pertObj) {
                if (pertIds.indexOf(pertObj._id) > -1) {
                  d3.select(that).selectAll('.highlight')
                    .style('opacity', 1)
                    .style('fill', 'yellow');
                }
              });
            });
          });
          vm.resultsLoading = false;
        });
      });
    });
  }

  function queryLDR() {
    $http({
      url: 'http://amp.pharm.mssm.edu/LDR/api/releases/filter',
      method: 'GET',
      params: vm.query
    }).then(function(response) {
      vm.releases = [];
      lodash.each(response.data, function(obj) {
        if (obj.released) {
          obj.releaseDates.upcoming = new Date(obj.releaseDates.upcoming);
          vm.releases.push(obj);
        }
      });
    });

  }

}
