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
// 計算距離
function main(userCenter) {
    let markersInDistance = []

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
    var map = L.map('map', {
        center: userCenter,
        zoom: 16
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    var greenIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    var redIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var markers = new L.MarkerClusterGroup().addTo(map);;

    function getmaskJSON() {
        var xhr = new XMLHttpRequest();
        xhr.open("get", "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json");
        xhr.send();
        xhr.onload = function() {
            var data = JSON.parse(xhr.responseText).features
            console.log(data)
            for (let i = 0; data.length > i; i++) {
                var mask;
                if (data[i].properties.mask_adult == 0) {
                    mask = redIcon;
                } else {
                    mask = greenIcon;
                }
                markers.addLayer(L.marker([data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]], { icon: mask }).bindPopup('<h1>' + data[i].properties.name + '</h1>' + '<p>成人口罩數量' + data[i].properties.mask_adult + '</p>'));
                // add more markers here...
                // L.marker().addTo(map)
                //   )
                if (geoDistance(userCenter[0], userCenter[1], data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]) < 1) {
                    data[i].distance = geoDistance(userCenter[0], userCenter[1], data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]).toFixed(2)
                    markersInDistance.push(data[i])
                }
            }
            map.addLayer(markers);
            console.log(markersInDistance)

            for (let i = 0; data.length > i; i++) {
                str += `<li>${data[i].properties.name}</li>`
            }

            var str = ''
            markersInDistance.forEach(item => {
                str += `
            <li class="groupLi">
                <div class="quantities">
                    <div class="quantities_content ${item.properties.mask_adult!==0?(item.properties.mask_adult>50 ?'quantities_full':'quantities_few'):'quantities_none'}">
                        <h3 class="quantities_title">成人口罩數量</h3>
                        <div class="quantities_numbers">
                            <div>
                                <h3>${item.properties.mask_adult}</h3><span>片</span></div>
                            <img class="quantities_stockpic" src="/img/ic_stock_${item.properties.mask_adult!==0?(item.properties.mask_adult>50 ?'full':'few'):'none'}@2x.png" alt="">
                        </div>
                    </div>
                    <div class="quantities_content ${item.properties.mask_child!==0?(item.properties.mask_child>50 ?'quantities_full':'quantities_few'):'quantities_none'} ">
                        <h3 class="quantities_title">兒童口罩數量</h3>
                        <div class="quantities_numbers">
                            <div>
                                <h3>${item.properties.mask_child}</h3><span>片</span></div>
                            <img class="quantities_stockpic" src="/img/ic_stock_${item.properties.mask_child!==0?(item.properties.mask_child>50 ?'full':'few'):'none'}@2x.png" alt="">
                        </div>
                    </div>
                </div>
                <div class="groupLi_content">
                    <span class="groupLi_title">
                            <h3>${item.properties.name}</h3>
                            <small>${item.distance}km</small>
                            <p>即將休息</p>
                        </span>
                    <span class="groupLi_address">
                            <span>
                                <h3>地址</h3>
                                <p>${item.properties.address}</p>
                            </span>
                    <a href="#">於地圖查看</a>
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
            document.querySelector('.group').innerHTML = str
        }
    }
    getmaskJSON()
        //監聽目前位置按鈕
    let location_btn = document.querySelector(".location_btn")
    location_btn.addEventListener("click", function() {
        mainAlert()
    })
    let refresh = document.querySelector(".refresh")
    refresh.addEventListener("click", function() {
        mainAlert()
    })

    function mainAlert() {
        markersInDistance = []
        var xhr = new XMLHttpRequest();
        xhr.open("get", "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json");
        xhr.send();
        xhr.onload = function() {
            var data = JSON.parse(xhr.responseText).features
            console.log(data)
            for (let i = 0; data.length > i; i++) {
                if (geoDistance(userCenter[0], userCenter[1], data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]) < 1) {
                    data[i].distance = geoDistance(userCenter[0], userCenter[1], data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]).toFixed(2)
                    markersInDistance.push(data[i])
                }
            }

            console.log(markersInDistance)
            for (let i = 0; data.length > i; i++) {
                str += `<li>${data[i].properties.name}</li>`
            }

            var str = ''
            markersInDistance.forEach(item => {
                str += `
            <li class="groupLi">
                <div class="quantities">
                    <div class="quantities_content ${item.properties.mask_adult!==0?(item.properties.mask_adult>50 ?'quantities_full':'quantities_few'):'quantities_none'}">
                        <h3 class="quantities_title">成人口罩數量</h3>
                        <div class="quantities_numbers">
                            <div>
                                <h3>${item.properties.mask_adult}</h3><span>片</span></div>
                            <img class="quantities_stockpic" src="/img/ic_stock_${item.properties.mask_adult!==0?(item.properties.mask_adult>50 ?'full':'few'):'none'}@2x.png" alt="">
                        </div>
                    </div>
                    <div class="quantities_content ${item.properties.mask_child!==0?(item.properties.mask_child>50 ?'quantities_full':'quantities_few'):'quantities_none'} ">
                        <h3 class="quantities_title">兒童口罩數量</h3>
                        <div class="quantities_numbers">
                            <div>
                                <h3>${item.properties.mask_child}</h3><span>片</span></div>
                            <img class="quantities_stockpic" src="/img/ic_stock_${item.properties.mask_child!==0?(item.properties.mask_child>50 ?'full':'few'):'none'}@2x.png" alt="">
                        </div>
                    </div>
                </div>
                <div class="groupLi_content">
                    <span class="groupLi_title">
                            <h3>${item.properties.name}</h3>
                            <small>${item.distance}km</small>
                            <p>即將休息</p>
                        </span>
                    <span class="groupLi_address">
                            <span>
                                <h3>地址</h3>
                                <p>${item.properties.address}</p>
                            </span>
                    <a href="#">於地圖查看</a>
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
            document.querySelector('.group').innerHTML = str
        }
    }
}