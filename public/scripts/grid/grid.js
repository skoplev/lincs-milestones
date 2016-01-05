/*eslint camelcase: 0*/

angular
  .module('indexControllers', ['ngLodash', 'clustergram'])
  .controller('Docent3Controller', Docent3Controller);

/* @ngInject */
function Docent3Controller($window, $scope, $http, d3, d3Data, lodash) {

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
  vm.keywords = [
    'Collagen I',
    'L1000',
    'MEMA',
    'MCF7',
  ];
  vm.query = {
    dataset: '',
    cellLine: '',
    perturbagens: []
  };
  vm.arguments = {
    network_data: d3Data,
    svg_div_id: 'svg-div',
    row_label: 'Assays',
    row_label_scale: 0.7,
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
    vm.query = {
      cellLine: rowCol === 'col' ? label : null,
      dataset: rowCol === 'row' ? label : null
    };
    queryLDR();
  }

  function tileCb(tileInfo) {
    d3.selectAll('.tile').each(function(d, i) {
      if (!lodash.isEqual(d, tileInfo)) {
        d3.select(this).selectAll('.highlight').style('opacity', 0);
      }
    });
    vm.resultIsSearch = false;
    var pertIds = lodash.map(tileInfo.perts, function(pert) {
      return pert._id;
    });
    vm.query = {
      dataset: tileInfo.row,
      cellLine: tileInfo.col,
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

  function checkForIcons(release) {
    var dsName = release.datasetName;
    var assay = release.metadata.assay[0];
    // Assay RegExps
    var l1000RegEx = /L1000/i;
    var p100RegEx = /P100/i;
    var gcpAbbrRegEx = /GCP/i;
    var gcpRegEx = /Global Chromatin Profiling/i;

    var isL1000 = l1000RegEx.test(dsName) || l1000RegEx.test(assay);
    var isP100 = p100RegEx.test(dsName) || p100RegEx.test(assay);
    var isGCP = gcpAbbrRegEx.test(dsName) || gcpAbbrRegEx.test(assay) ||
      gcpRegEx.test(dsName) || gcpRegEx.test(dsName);

    release.useSlicer = isL1000;
    release.usePiLINCS = isP100 || isGCP;
    release.useMosaic = isP100 || isGCP;
  }

  function search(query) {
    if (query.length) {
      vm.searchQ = query;
    } else if (!vm.searchQ.length) {
      return;
    }

    vm.resultIsSearch = true;
    vm.searchQCopy = vm.searchQ;
    var labelSelected = false;

    d3.selectAll('.row_label_text').each(function(d, i) {
      var label = d3.select(this).text();
      if (vm.searchQ === label && !labelSelected) {
        d3.select(this).on('click').apply(this, [d, i]);
        labelSelected = true;
      }
    });

    d3.selectAll('.col_label_text').each(function(d, i) {
      var label = d3.select(this).text();
      if (vm.searchQ === label && !labelSelected) {
        d3.select(this).on('click').apply(this, [d, i]);
        labelSelected = true;
      }
    });

    if (labelSelected) {
      return;
    }

    vm.resultsLoading = true;

    getDatasetsWithPerts(vm.searchQ, function(dsWithPerts) {
      getDatasetsWithCLines(vm.searchQ, function(dsWithCLines) {
        getDatasets(vm.searchQ, function(datasets) {
          var concatArr = dsWithPerts.concat(dsWithCLines, datasets);
          vm.releases = lodash.uniq(concatArr, false, '_id');
          d3.selectAll('.click_hlight').style('opacity', 0);
          lodash.each(vm.releases, function(release) {
            checkForIcons(release);
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
      lodash.each(response.data, function(release) {
        if (release.released) {
          release.releaseDates.upcoming = new Date(release.releaseDates.upcoming);
          checkForIcons(release)
          vm.releases.push(release);
        }
      });
    });
  }

  vm.summary = {
    center: 0,
    assays: 0,
    cellLines: 0,
    perturbagens: 0
  };

  function countUpTo(field, count, max, step, time) {
    setTimeout(function() {
      if (count === max) {
        return;
      } else if (count + step > max) {
        countUpTo(field, count, max, 1, 0);
      } else {
        count = count + step;
        vm.summary[field] = count;
        $scope.$apply();
        countUpTo(field, count, max, step, time);
      }
    }, time);
  }

  function generateCounts() {
    $http({
      url: 'http://amp.pharm.mssm.edu/LDR/api/counts/released',
      method: 'GET',
    }).then(function(response) {
      var counts = response.data;
      counts.center = 6;
      countUpTo('center', 0, counts.center, 1, 50);
      countUpTo('assays', 0, counts.assays, 1, 10);
      countUpTo('perturbagens', 0, counts.perturbagens, 50, 10);
      countUpTo('cellLines', 0, counts.cellLines, 5, 10);
    });
  }

  generateCounts();
}
