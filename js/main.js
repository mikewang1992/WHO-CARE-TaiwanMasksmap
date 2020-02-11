$(document).ready(function() {
    navigator.geolocation.getCurrentPosition(function(position) {
        let userCenter = []
        userCenter.push(position.coords.latitude)
        userCenter.push(position.coords.longitude)
        console.log(position, position.coords.latitude, position.coords.longitude)
        console.log(userCenter)
        main(userCenter)
    }, function geo_error() {
        alert('獲取位置失敗,那就看作者家附近吧')
        let userCenter = [22.602625, 120.305627]
        main(userCenter)
    });

    function main(userCenter) {
        let markersInDistance = []
            // 計算距離
        function geoDistance(lat1, lng1, lat2, lng2, range) {
            function rad(d) {
                return d * Math.PI / 180.0;
            }
            let radLat1 = rad(lat1);
            let radLat2 = rad(lat2);
            let a = radLat1 - radLat2;
            let b = rad(lng1) - rad(lng2);
            let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
            s = s * 6378.137; // EARTH_RADIUS;
            s = Math.round(s * 10000) / 10000; //输出为公里
            return s
                // if (s < range) {
                //     markersInDistance.push(s)
                // }
        }
        //地圖主體
        var map = L.map('map', {
            center: userCenter,
            zoom: 16
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        var redIcon = new L.Icon({
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        var greenIcon = new L.Icon({
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        var orangeIcon = new L.Icon({
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        var greyIcon = new L.Icon({
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        var data

        function getmaskJSON() {
            var markers = new L.MarkerClusterGroup().addTo(map);
            var xhr = new XMLHttpRequest();
            xhr.open("get", "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json");
            xhr.send();
            xhr.onload = function() {
                //地圖所有點加至markers層
                data = JSON.parse(xhr.responseText).features
                console.log(data)
                for (let i = 0; data.length > i; i++) {
                    console.log(i++, data[i].geometry.coordinates[1])
                    var mask;
                    if (data[i].properties.mask_adult > 50) {
                        mask = greenIcon;
                    } else if (data[i].properties.mask_adult > 0) {
                        mask = orangeIcon
                    } else {
                        mask = greyIcon;
                    }
                    markers.addLayer(L.marker([data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]], { icon: mask }).bindPopup(`<h2>${data[i].properties.name}</h2><p>成人口罩數量:${data[i].properties.mask_adult}</p><p>兒童口罩數量:${data[i].properties.mask_child}</p><p>地址:${data[i].properties.address}</p><p>電話:${data[i].properties.phone}</p>`));
                    if (geoDistance(userCenter[0], userCenter[1], data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]) < 1) {
                        data[i].distance = geoDistance(userCenter[0], userCenter[1], data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]).toFixed(2)
                        markersInDistance.push(data[i])
                    }
                }
                map.addLayer(L.marker(userCenter, { icon: redIcon }).bindPopup('<h2>你的位置</h2>'))
                map.addLayer(markers);
                //距離內藥局渲染
                console.log('距離內的藥局', markersInDistance)
                let str = ''
                let group = document.querySelector('.group')
                markersInDistance.sort(function(a, b) {
                    return a.distance - b.distance
                })
                markersInDistance.forEach(item => {
                    str += `
            <li class="groupLi">
                <div class="quantities">
                    <div class="quantities_content ${item.properties.mask_adult!==0?(item.properties.mask_adult>50 ?'quantities_full':'quantities_few'):'quantities_none'}">
                        <h3 class="quantities_title">成人口罩數量</h3>
                        <div class="quantities_numbers">
                            <div>
                                <h3>${item.properties.mask_adult}</h3><span>片</span></div>
                            <img class="quantities_stockpic" src="img/ic_stock_${item.properties.mask_adult!==0?(item.properties.mask_adult>50 ?'full':'few'):'none'}@2x.png" alt="">
                        </div>
                    </div>
                    <div class="quantities_content ${item.properties.mask_child!==0?(item.properties.mask_child>50 ?'quantities_full':'quantities_few'):'quantities_none'} ">
                        <h3 class="quantities_title">兒童口罩數量</h3>
                        <div class="quantities_numbers">
                            <div>
                                <h3>${item.properties.mask_child}</h3><span>片</span></div>
                            <img class="quantities_stockpic" src="img/ic_stock_${item.properties.mask_child!==0?(item.properties.mask_child>50 ?'full':'few'):'none'}@2x.png" alt="">
                        </div>
                    </div>
                </div>
                <div class="groupLi_content">
                    <span class="groupLi_title">
                            <h3>${item.properties.name}</h3>
                            <small>${item.distance}km</small>
                        </span>
                    <span class="groupLi_address">
                            <span>
                                <h3>地址</h3>
                                <p>${item.properties.address}</p>
                            </span>
                    <a class="mapMove" href="#" data-lat='${item.geometry.coordinates[1]}' data-long='${item.geometry.coordinates[0]}'>於地圖查看</a>
                    </span>
                    <span class="groupLi_phone">
                            <span>
                                <h3>電話</h3>
                                <p>${item.properties.phone}</p>
                            </span>
                    <a href="tel:${item.properties.phone}">撥打電話</a>
                    </span>
                </div>
            </li>`
                });
                group.innerHTML = str
                    //資料更新時間
                $('.updateTime').text('資訊更新時間 ' +
                    data[0].properties.updated)
            }
        }
        getmaskJSON()
            //計算奇偶數日
        let date = new Date
        $('.info_top').children('h2').text(
                function() {
                    if (date.getDay() == 1 || date.getDay() == 3 || date.getDay() == 5) {
                        return '奇數'
                    } else if (date.getDay() == 2 || date.getDay() == 4 || date.getDay() == 6) {
                        return '偶數'
                    } else {
                        return '無限制'
                    }
                }

            )
            //監聽搜尋
        $('.location_input').keyup(function() {
            console.log(data)
            if ($('.location_input').val() == '') {
                $('.location_input_overlay').hide()
                $('.location_input_overlay').html('')
                let group = document.querySelector('.group')
                let str2 = ''
                markersInDistance.forEach(item => {
                    str2 += `
        <li class="groupLi">
            <div class="quantities">
                <div class="quantities_content ${item.properties.mask_adult!==0?(item.properties.mask_adult>50 ?'quantities_full':'quantities_few'):'quantities_none'}">
                    <h3 class="quantities_title">成人口罩數量</h3>
                    <div class="quantities_numbers">
                        <div>
                            <h3>${item.properties.mask_adult}</h3><span>片</span></div>
                        <img class="quantities_stockpic" src="img/ic_stock_${item.properties.mask_adult!==0?(item.properties.mask_adult>50 ?'full':'few'):'none'}@2x.png" alt="">
                    </div>
                </div>
                <div class="quantities_content ${item.properties.mask_child!==0?(item.properties.mask_child>50 ?'quantities_full':'quantities_few'):'quantities_none'} ">
                    <h3 class="quantities_title">兒童口罩數量</h3>
                    <div class="quantities_numbers">
                        <div>
                            <h3>${item.properties.mask_child}</h3><span>片</span></div>
                        <img class="quantities_stockpic" src="img/ic_stock_${item.properties.mask_child!==0?(item.properties.mask_child>50 ?'full':'few'):'none'}@2x.png" alt="">
                    </div>
                </div>
            </div>
            <div class="groupLi_content">
                <span class="groupLi_title">
                        <h3>${item.properties.name}</h3>
                        <small>${item.distance}km</small>
                    </span>
                <span class="groupLi_address">
                        <span>
                            <h3>地址</h3>
                            <p>${item.properties.address}</p>
                        </span>
                <a class="mapMove" href="#" data-lat='${item.geometry.coordinates[1]}' data-long='${item.geometry.coordinates[0]}'>於地圖查看</a>
                </span>
                <span class="groupLi_phone">
                        <span>
                            <h3>電話</h3>
                            <p>${item.properties.phone}</p>
                        </span>
                <a href="tel:${item.properties.phone}">撥打電話</a>
                </span>
            </div>
        </li>`
                });
                group.innerHTML = str2
                return
            }
            var results = [];
            var toSearch = $('.location_input').val();
            for (var i = 0; i < markersInDistance.length; i++) {
                if (markersInDistance[i].properties['name'].indexOf(toSearch) != -1) {
                    results.push(markersInDistance[i]);
                }

            }
            console.log(results)
            $('.location_input_overlay').show()
            let str = ''
            results.forEach(function(item) {
                str += `<li class="location_input_overlayli" data-name="${item.properties.name}" data-address="${item.properties.address}" data-phone="${item.properties.phone}" data-mask_adult="${item.properties.mask_adult}" data-mask_child="${item.properties.mask_child}" data-distance="${item.distance}" data-lat="${item.geometry.coordinates[1]}" data-long="${item.geometry.coordinates[0]}">${item.properties.name}</li>`
                console.log(str)
            })
            $('.location_input_overlay').html(str)
            let group = document.querySelector('.group')
            let str2 = ''
            results.forEach(item => {
                str2 += `
        <li class="groupLi">
            <div class="quantities">
                <div class="quantities_content ${item.properties.mask_adult!==0?(item.properties.mask_adult>50 ?'quantities_full':'quantities_few'):'quantities_none'}">
                    <h3 class="quantities_title">成人口罩數量</h3>
                    <div class="quantities_numbers">
                        <div>
                            <h3>${item.properties.mask_adult}</h3><span>片</span></div>
                        <img class="quantities_stockpic" src="img/ic_stock_${item.properties.mask_adult!==0?(item.properties.mask_adult>50 ?'full':'few'):'none'}@2x.png" alt="">
                    </div>
                </div>
                <div class="quantities_content ${item.properties.mask_child!==0?(item.properties.mask_child>50 ?'quantities_full':'quantities_few'):'quantities_none'} ">
                    <h3 class="quantities_title">兒童口罩數量</h3>
                    <div class="quantities_numbers">
                        <div>
                            <h3>${item.properties.mask_child}</h3><span>片</span></div>
                        <img class="quantities_stockpic" src="img/ic_stock_${item.properties.mask_child!==0?(item.properties.mask_child>50 ?'full':'few'):'none'}@2x.png" alt="">
                    </div>
                </div>
            </div>
            <div class="groupLi_content">
                <span class="groupLi_title">
                        <h3>${item.properties.name}</h3>
                        <small>${item.distance}km</small>
                    </span>
                <span class="groupLi_address">
                        <span>
                            <h3>地址</h3>
                            <p>${item.properties.address}</p>
                        </span>
                <a class="mapMove" href="#" data-lat='${item.geometry.coordinates[1]}' data-long='${item.geometry.coordinates[0]}'>於地圖查看</a>
                </span>
                <span class="groupLi_phone">
                        <span>
                            <h3>電話</h3>
                            <p>${item.properties.phone}</p>
                        </span>
                <a href="tel:${item.properties.phone}">撥打電話</a>
                </span>
            </div>
        </li>`
            });
            group.innerHTML = str2
        });

        $('.location_input_overlay').on("click", function(e) {
            if (e.target.className !== 'location_input_overlayli') {
                return
            } else {
                $('.location_input_overlay').hide()
                $('.location_input_overlay').html('')
                let group = document.querySelector('.group')
                group.innerHTML =
                    `<li class="groupLi">
                <div class="quantities">
                    <div class="quantities_content ${e.target.dataset.mask_adult!==0?(e.target.dataset.mask_adult>50 ?'quantities_full':'quantities_few'):'quantities_none'}">
                        <h3 class="quantities_title">成人口罩數量</h3>
                        <div class="quantities_numbers">
                            <div>
                                <h3>${e.target.dataset.mask_adult}</h3><span>片</span></div>
                            <img class="quantities_stockpic" src="img/ic_stock_${e.target.dataset.mask_adult!==0?(e.target.dataset.mask_adult>50 ?'full':'few'):'none'}@2x.png" alt="">
                        </div>
                    </div>
                    <div class="quantities_content ${e.target.dataset.mask_child!==0?(e.target.dataset.mask_child>50 ?'quantities_full':'quantities_few'):'quantities_none'} ">
                        <h3 class="quantities_title">兒童口罩數量</h3>
                        <div class="quantities_numbers">
                            <div>
                                <h3>${e.target.dataset.mask_child}</h3><span>片</span></div>
                            <img class="quantities_stockpic" src="img/ic_stock_${e.target.dataset.mask_child!==0?(e.target.dataset.mask_child>50 ?'full':'few'):'none'}@2x.png" alt="">
                        </div>
                    </div>
                </div>
                <div class="groupLi_content">
                    <span class="groupLi_title">
                            <h3>${e.target.dataset.name}</h3>
                            <small>${e.target.dataset.distance}km</small>
                        </span>
                    <span class="groupLi_address">
                            <span>
                                <h3>地址</h3>
                                <p>${e.target.dataset.address}</p>
                            </span>
                    <a class="mapMove" href="#" data-lat='${e.target.dataset.lat}' data-long='${ e.target.dataset.long}'>於地圖查看</a>
                    </span>
                    <span class="groupLi_phone">
                            <span>
                                <h3>電話</h3>
                                <p>${e.target.dataset.phone}</p>
                            </span>
                    <a href="tel:${e.target.dataset.phone}">撥打電話</a>
                    </span>
                </div>
            </li>`
            }
        })

        //資訊圖片
        $('.overlay').hide()
        $('.info_top').children('img').click(function() {
            $('.overlay').show()
        })
        $('.overlay').click(function() { $('.overlay').hide() })
            //監聽目前位置按鈕
        $(".location_btn").on('click', function() {
                map.flyTo(userCenter, 16)
            })
            //重整列表按鈕
        $(".refresh").on('click', function() {
                markersInDistance = []
                markers = null
                markers = new L.MarkerClusterGroup().addTo(map);
                var xhr = new XMLHttpRequest();
                xhr.open("get", "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json");
                xhr.send();
                xhr.onload = function() {
                    //地圖所有點加至markers層
                    var data = JSON.parse(xhr.responseText).features
                    console.log(data)
                    console.log(data[0].geometry)
                    for (let i = 0; data.length > i; i++) {
                        var mask;
                        if (data[i].properties.mask_adult > 50) {
                            mask = greenIcon;
                        } else if (data[i].properties.mask_adult > 0) {
                            mask = orangeIcon
                        } else {
                            mask = greyIcon;
                        }
                        markers.addLayer(L.marker([data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]], { icon: mask }).bindPopup(`<h2>${data[i].properties.name}</h2><p>成人口罩數量:${data[i].properties.mask_adult}</p><p>兒童口罩數量:${data[i].properties.mask_child}</p><p>地址:${data[i].properties.address}</p><p>電話:${data[i].properties.phone}</p>`));
                        if (geoDistance(userCenter[0], userCenter[1], data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]) < 1) {
                            data[i].distance = geoDistance(userCenter[0], userCenter[1], data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]).toFixed(2)
                            markersInDistance.push(data[i])
                        }
                    }
                    map.addLayer(L.marker(userCenter, { icon: redIcon }).bindPopup('<h2>你的位置</h2>'))
                    map.addLayer(markers);
                    //距離內藥局渲染
                    console.log('距離內的藥局', markersInDistance)
                    let str = ''
                    let group = document.querySelector('.group')
                    markersInDistance.sort(function(a, b) {
                        return a.distance - b.distance
                    })
                    markersInDistance.forEach(item => {
                        str += `
            <li class="groupLi">
                <div class="quantities">
                    <div class="quantities_content ${item.properties.mask_adult!==0?(item.properties.mask_adult>50 ?'quantities_full':'quantities_few'):'quantities_none'}">
                        <h3 class="quantities_title">成人口罩數量</h3>
                        <div class="quantities_numbers">
                            <div>
                                <h3>${item.properties.mask_adult}</h3><span>片</span></div>
                            <img class="quantities_stockpic" src="img/ic_stock_${item.properties.mask_adult!==0?(item.properties.mask_adult>50 ?'full':'few'):'none'}@2x.png" alt="">
                        </div>
                    </div>
                    <div class="quantities_content ${item.properties.mask_child!==0?(item.properties.mask_child>50 ?'quantities_full':'quantities_few'):'quantities_none'} ">
                        <h3 class="quantities_title">兒童口罩數量</h3>
                        <div class="quantities_numbers">
                            <div>
                                <h3>${item.properties.mask_child}</h3><span>片</span></div>
                            <img class="quantities_stockpic" src="img/ic_stock_${item.properties.mask_child!==0?(item.properties.mask_child>50 ?'full':'few'):'none'}@2x.png" alt="">
                        </div>
                    </div>
                </div>
                <div class="groupLi_content">
                    <span class="groupLi_title">
                            <h3>${item.properties.name}</h3>
                            <small>${item.distance}km</small>
                        </span>
                    <span class="groupLi_address">
                            <span>
                                <h3>地址</h3>
                                <p>${item.properties.address}</p>
                            </span>
                            <a class="mapMove" href="#" data-lat='${item.geometry.coordinates[1]}' data-long='${item.geometry.coordinates[0]}'>於地圖查看</a>
                    </span>
                    <span class="groupLi_phone">
                            <span>
                                <h3>電話</h3>
                                <p>${item.properties.phone}</p>
                            </span>
                    <a href="tel:${item.properties.phone}">撥打電話</a>
                    </span>
                </div>
            </li>`
                    });
                    group.innerHTML = str
                        //資料更新時間
                    $('.updateTime').text('資訊更新時間 ' +
                        data[0].properties.updated)
                }
            })
            //移至地圖位置按鈕
        $(".group").on('click', function(e) {
            if (e.target.className !== 'mapMove') {
                return
            }
            if (window.matchMedia("(max-width: 414px)").matches) {
                $('.sidebar').slideToggle('slow')
            }
            map.flyTo([e.target.dataset.lat, e.target.dataset.long], 18)
        })
        $(".burger").click(function() {
            $(".sidebar").slideToggle('fast')
        })
    }
})