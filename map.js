var mapBorderColor = '#fff';
var mapAreaColor = '#ddd';
var highlightAreaColor = '#CDB1B1';
var labelColor = "#763131";


var geoCoordMap = {
    "Haimen":[121.15,31.89],
    "Ordos": [109.781327,39.608266],
    "Zhaoyuan":[120.38,37.35],
    "Zhoushan":[122.207216,29.985295],
    "Qiqihar":[123.97,47.33],
    "Yancheng":[120.13,33.38],
    "Chifeng":[118.87,42.28],
    "Qingdao":[120.33,36.07],
    "Rushan":[121.52,36.89],
    "Jinchang":[102.188043,38.520089],
};
//Splice object array
var convertData = function (data) {
   var res = [];
   for (var i = 0; i < data.length; i++) {
        var geoCoord = geoCoordMap[data[i].name];//Get coordinates
        if (geoCoord) {//If there are coordinates
            res.push({//Create an array of objects,
               name: data[i].name,  
                                        value: geoCoord.concat(data[i].value) //Add value value in the form of connected array
           });  
           //res.push(geoCoord.concat(data[i].value));
           //res.push(geoCoord.concat(data[i].name));
       }
   }
   return res;
};


async function initChart() {
    let chart = echarts.init(document.getElementById('map'));
    let alladcode = await getGeoJson('all.json')
    let chinaGeoJson = await getGeoJson(geoData + '_full.json')
    initEcharts(chinaGeoJson, titleName, chart, alladcode)
}
initChart();

//echarts绘图
function initEcharts(geoJson, name, chart, alladcode) {
    echarts.registerMap(name, geoJson);
    let option = {
        tooltip: {
            trigger: 'item',
            showDelay: 0,
            transitionDuration: 0.2,
            formatter: function (params) {
                return params.name
            }
        },
        title: {
            text: name,
            left: 'center',
        },
        series: [
            {
                type: 'map',
                map: name,
                tooltip: {
                    textStyle: {
                        color: "#000"
                    }
                },
                itemStyle: {
                    borderWidth: 1,
                    borderColor: mapBorderColor,
                    areaColor: mapAreaColor,
                },
                emphasis: {
                    //focus: 'self',
                    label: {
                        color: labelColor,
                    },
                    itemStyle: {
                        // 高亮时点的颜色。
                        areaColor: highlightAreaColor,
                    },
                },
                select: {
                    itemStyle: {
                        // 高亮时点的颜色。
                        areaColor: highlightAreaColor,
                    },

                }
            },
            {
                name: 'court',
                type: 'scatter',
                coordinateSystem: 'geo',
                geoIndex: [116.916837, 39.731314],
                symbolSize: 10,
                symbol: 'circle',
                label: {
                    formatter: 'hi',
                    position: 'right'
                },
                itemStyle: {
                    color: '#000'
                },
                emphasis: {
                    label: {
                        show: true
                    }
                }
            },

        ],
    }
    option && chart.setOption(option)
    // 解绑click事件
    chart.off("click");

    chart.getZr().on('click', function (event) {
        // 没有 target 意味着鼠标/指针不在任何一个图形元素上，它是从“空白处”触发的。
        if (!event.target) {
            getGeoJson(geoData + '_full.json').then(
                chinaGeoJson => initEcharts(chinaGeoJson, titleName, chart, alladcode)
            )
            // 点击在了空白处，做些什么。
        }
    });
    //给地图添加监听事件
    chart.on('click', params => {
        let clickRegionCode = alladcode.filter(areaJson => areaJson.name === params.name)[0].adcode;
        getGeoJson(clickRegionCode + '_full.json').then(regionGeoJson => initEcharts(regionGeoJson, params.name, chart, alladcode))
        .catch(err => {
            getGeoJson(geoData + '_full.json').then(
                chinaGeoJson => initEcharts(chinaGeoJson, titleName, chart, alladcode)
            )
        })
    })
}
//获取地图json数据
async function getGeoJson(jsonName) {
    return await $.get(publicUrl + jsonName)
}