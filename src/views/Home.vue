<template>
	<v-row no-gutters="" align="start" id="homeMain">
		<div style="z-index:99999;position:fixed;" v-if="showHelp"
			><v-btn
				@click="showHelp = false"
				fixed=""
				fab
				top
				right
				color="lime"
				x-small=""
				elevation="1"
				class="black--text"
			>
				<v-icon dense="">fa-times</v-icon>
			</v-btn>
			<img
				src="../assets/help.png"
				:style="
					`height:${$store.state.windowHeight}px;width:${$store.state.windowWidth}px;`
				"
			/>
		</div>
		<v-col cols="12">
			<v-app-bar color="white" fixed="" flat="" dense="">
				<v-toolbar-title class="subtitle-1"
					><v-icon left="" dense="" color="primary">fa-map-marker-alt</v-icon
					>{{ $t($store.state.startPointInfo.name) }}</v-toolbar-title
				>
				<v-spacer></v-spacer>
				<v-btn icon to="/search" replace="">
					<v-icon>fa-search</v-icon>
				</v-btn>

				<v-menu offset-y bottom>
					<template v-slot:activator="{ on }">
						<v-btn v-on="on" icon>
							<v-icon>fa-language</v-icon>
						</v-btn>
					</template>
					<v-list dense="">
						<v-list-item
							v-for="(item, index) in $i18n.messages"
							:key="index"
							@click="changeLang(index)"
							class=" subtitle-2"
						>
							{{ $t(index) }}
						</v-list-item>
					</v-list>
				</v-menu>
			</v-app-bar>
		</v-col>
		<v-col cols="12" class="mt-10">
			<v-card elevation="2" tile="">
				<v-container>
					<v-card elevation="0">
						<v-skeleton-loader
							:loading="banner.length === 0"
							:transition="transition"
							:height="bannerHeight"
							type="card"
						>
							<v-carousel
								:height="bannerHeight"
								cycle=""
								:show-arrows="false"
								hide-delimiters
								:interval="3000"
							>
								<v-carousel-item v-for="(b, i) in banner" :key="i">
									<v-card flat="">
										<v-img
											@click="bannerClick(b, i)"
											:src="b.img"
											:height="bannerHeight"
											background-color="white"
										></v-img>
									</v-card>
								</v-carousel-item>
							</v-carousel>
						</v-skeleton-loader>
					</v-card>
					<v-card elevation="0" class="mt-2" outlined="">
						<v-row
							no-gutters=""
							align="center"
							justify="center"
							class="blue lighten-4"
						>
							<v-col cols="3" class="text-center">
								<v-card
									elevation="0"
									height="100%"
									class=" caption blue lighten-4"
								>
									{{ getWeek() }}<br /><span class="overline">{{
										dateFormat()
									}}</span>
								</v-card>
							</v-col>
							<v-col cols="9" class="pl-1 white">
								<v-row no-gutters="" align="start" justify="start"
									><v-col cols="12"
										><v-toolbar-title
											class="subtitle-2 text--darken-1 grey--text"
										>
											{{ weatherString }}
										</v-toolbar-title></v-col
									></v-row
								>
								<v-row no-gutters="" class="mt-1"
									><v-col cols="12">
										<v-skeleton-loader
											:loading="articles.length === 0"
											:transition="transition"
											max-height="50"
											type="paragraph"
											><v-carousel
												height="52"
												cycle=""
												:show-arrows="false"
												hide-delimiters
												:interval="5000"
												class=" overflow-hidden"
											>
												<v-carousel-item v-for="(item, i) in articles" :key="i">
													<div @click="navPage('article/' + item.article_id)">
														<span class="overline">{{ item.date }}</span>
														{{ item.article_title }}
													</div>
												</v-carousel-item>
											</v-carousel></v-skeleton-loader
										></v-col
									></v-row
								>
							</v-col></v-row
						>
					</v-card>
				</v-container>
			</v-card>
		</v-col>
		<v-col cols="12" class="mt-1">
			<div
				class="amap-page-container amap"
				id="amapHome"
				:style="`height:${windowHeight - bannerHeight - 226}px`"
			>
				<el-amap
					ref="map"
					vid="amap"
					:amap-manager="amapManager"
					:center="center"
					:zooms="$store.state.mapZooms"
					:zoom="zoom"
					:plugin="plugin"
					:events="events"
				>
					<el-amap-marker
						v-for="(marker, index) in markerList"
						:key="index"
						:label="marker.label"
						:position="marker.lnglat"
						:offset="markerOffset"
						:vid="marker.id"
					/>
				</el-amap>
			</div>
		</v-col>
		<v-tabs
			height="70"
			hide-slider=""
			icons-and-text=""
			show-arrows=""
			fixed-tabs=""
		>
			<v-tab
				v-for="(item, index) in bottomNav"
				:key="index"
				@click="navPage(item.text)"
				><span :class="`black--text mb-1 ${navFont}`">{{ $t(item.text) }}</span>
				<v-img :src="item.image" width="45" contain=""></v-img
			></v-tab>
		</v-tabs>
		<!-- <v-bottom-navigation grow color="primary" fixed="" height="70">
			<v-btn
				v-for="(item, index) in bottomNav"
				:key="index"
				@click="navPage(item.text)"
			>
				<span :class="`black--text mb-1 ${navFont}`">{{ $t(item.text) }}</span>
				<v-img :src="item.image" width="50" contain=""></v-img>
			</v-btn>
		</v-bottom-navigation> -->
		<v-img
			v-show="enterMap"
			id="toMapBtn"
			class="toMapBtn"
			src="../assets/toMapBtn.png"
			@click="navPage('map')"
		></v-img>
	</v-row>
</template>

<script>
import { AMapManager, lazyAMapApiLoaderInstance } from "vue-amap";
export default {
	components: {},
	mounted() {
		const _this = this;

		if (this.$i18n.locale === "zh_CN") {
			this.navFont = "subtitle-2";
		}
		_this.loadBanner();
		const mapBtnInterval = setInterval(function() {
			const d = document.getElementById("toMapBtn");
			const ac = document.getElementsByClassName("amap-controls")[0];
			if (d && ac) {
				clearInterval(mapBtnInterval);
				ac.appendChild(d);
				_this.enterMap = true;
			}
		}, 1000);
		const flexibleLayer = new window.AMap.TileLayer.Flexible({
			/**
			 * 自定义切片属性，返回值为切片图片或 canvas
			 * @param x: 切片横向编号
			 * @param y: 切片纵向编号
			 * @param z: 切片层级
			 * @param success: 创建成功回调
			 * @param fail: 创建失败回调
			 */
			createTile: function(x, y, z, success, fail) {
				// var image = imageList[x];
				var img = document.createElement("img");
				img.onload = function() {
					success(img);
				};
				// img.crossOrigin = "anonymous";//3D 的时候添加，同时图片要有跨域头
				img.onerror = function() {
					fail();
				};

				img.src =
					"https://o.signp.cn/maps/1403/zh_CN/" +
					z +
					"/" +
					x +
					"/" +
					y +
					".png";
			},
			opacity: 1,
			visible: true,
			cacheSize: 256, // 内存中缓存的切片的数量上限
			zIndex: 999,
			zooms: [14, 18] // 设置可见级别，[最小级别，最大级别]
		});
		lazyAMapApiLoaderInstance.load().then(function() {
			_this.$refs.map.$$getInstance().add(flexibleLayer);
			_this.mapLimitBounds();
		});
		const showHelp = localStorage.getItem("signp-145:showHelp");
		if (!showHelp) this.showHelp = true;
	},
	computed: {
		locale() {
			return this.$i18n.locale;
		},
		bannerHeight() {
			return parseInt(this.$store.state.windowHeight / 4);
		},
		windowHeight() {
			return this.$store.state.windowHeight;
		}
	},
	watch: {
		locale: {
			handler(val) {
				let lang = val;
				if (!lang) lang = "zh_CN";
				if (lang === "zh_CN") {
					this.navFont = "subtitle-2";
				} else {
					this.navFont = "";
				}
				this.loadArticles();
				this.loadWeather();
				// this.loadPolygons();
			},
			immediate: true
		},
		showHelp(val) {
			if (val === true) {
				localStorage.setItem("signp-145:showHelp", "ok");
			}
		}
	},
	data() {
		let self = this;
		return {
			showHelp: false,
			bannerType: "round",
			articles: [],
			navFont: "",
			enterMap: false,
			transition: "scale-transition",
			markerOffset: [0, 0],
			markerList: [],
			weatherString: "",
			bottomNav: [
				{
					text: "attractions",
					image: require("@/assets/b1.png")
				},
				{
					text: "vr",
					image: require("@/assets/b5.png")
				},
				{
					text: "about",
					image: require("@/assets/b6.png")
				},
				{
					text: "recommend",
					image: require("@/assets/b2.png")
				},
				{
					text: "help",
					image: require("@/assets/b4.png")
				},
				{
					text: "surrounding",
					image: require("@/assets/b3.png")
				}
			],
			banner: [],
			amapManager: new AMapManager(),
			zoom: 16,
			center: self.$store.state.startPointInfo.center.split(","),
			lng: 0,
			lat: 0,
			events: {},
			amapPosition: false,
			mapBounds: {
				16: [[0, 0], [23.109626, 0]],
				15: "113.257626, 23.112409;113.271102, 23.121921"
			},
			plugin: [
				{
					pName: "Geolocation",
					events: {
						init() {
							// o.getCurrentPosition((status, result) => {
							// 	if (result && result.position) {
							// 		self.lng = result.position.lng;
							// 		self.lat = result.position.lat;
							// 		self.center = [self.lng, self.lat];
							// 		self.amapPosition = true;
							// 		self.$nextTick();
							// 	}
							// 	self.$nextTick(function(){
							// 	})
							// });
						}
					}
				}
			]
		};
	},
	methods: {
		mapLimitBounds() {
			const bounds = new window.AMap.Bounds(
				new window.AMap.LngLat(
					this.$store.state.mapBounds.southWest[0],
					this.$store.state.mapBounds.southWest[1]
				),
				new window.AMap.LngLat(
					this.$store.state.mapBounds.northEast[0],
					this.$store.state.mapBounds.northEast[1]
				)
			);
			this.$refs.map.$$getInstance().setLimitBounds(bounds);
		},
		getWeek() {
			const weekDay = [
				this.$t("week7"),
				this.$t("week1"),
				this.$t("week2"),
				this.$t("week3"),
				this.$t("week4"),
				this.$t("week5"),
				this.$t("week6")
			];
			const d = new Date();
			return weekDay[d.getDay()];
		},
		dateFormat(timestamp, sep = "-") {
			let d = new Date();
			if (timestamp) {
				d = new Date(timestamp);
			}
			const nowDay = d.getDate();
			const day = nowDay >= 10 ? nowDay.toString() : "0" + nowDay.toString();
			const html = [
				d.getFullYear().toString(),
				(d.getMonth() + 1).toString(),
				day
			];
			return html.join(sep);
		},
		loadArticles() {
			const _this = this;
			_this.articles = [];
			const readStore = _this.$store.state.db
				.transaction("articles")
				.objectStore("articles")
				.get(
					_this.$store.state.startPointInfo.index_article_category +
						"_" +
						_this.$i18n.locale
				);
			readStore.onsuccess = function(e) {
				const r = e.target.result;
				const nowTime = new Date().getTime();
				if (r && r.timestamp > nowTime && r.val.length > 0) {
					for (let i = 0; i < r.val.length; i++) {
						let _d = new Date(parseInt(r.val[i].article_create_at) * 1000);
						r.val[i].date =
							_d.getFullYear() + "/" + (_d.getMonth() + 1) + "/" + _d.getDate();
						_this.articles.push(r.val[i]);
					}
				} else {
					_this.$http
						.get(_this.apiHost + "/articles", {
							params: {
								categoryID:
									_this.$store.state.startPointInfo.index_article_category,
								locale: _this.$i18n.locale,
								limit: _this.$store.state.startPointInfo.articleLimit,
								projectID: _this.$store.state.startPointInfo.project_id,
								timestamp: parseInt(new Date().getTime() / 1000)
							}
						})
						.then(function(resp) {
							if (resp.status === 200) {
								const timestamp = new Date().getTime() + 300 * 1000;
								const writeStore = _this.$store.state.db
									.transaction("articles", "readwrite")
									.objectStore("articles");
								writeStore.put({
									article_category_id:
										_this.$store.state.startPointInfo.index_article_category +
										"_" +
										_this.$i18n.locale,
									timestamp: timestamp,
									val: resp.body
								});
								for (let i = 0; i < resp.body.length; i++) {
									let _d = new Date(
										parseInt(resp.body[i].article_create_at) * 1000
									);
									resp.body[i].date =
										_d.getFullYear() +
										"/" +
										(_d.getMonth() + 1) +
										"/" +
										_d.getDate();
									_this.articles.push(resp.body[i]);
								}
							}
						});
				}
			};
		},
		loadBanner() {
			const _this = this;
			_this.articles = [];
			const readStore = _this.$store.state.db
				.transaction("banner")
				.objectStore("banner")
				.get(_this.bannerType);
			readStore.onsuccess = function(e) {
				const banner = [
					// {
					// 	img: require("@/assets/banner1.jpg"),
					// 	title: "",
					// 	link: "about",
					// 	mapGid: ""
					// }
				];
				const r = e.target.result;
				const nowTime = new Date().getTime();
				if (r && r.timestamp > nowTime && r.val.length > 0) {
					for (let i = 0; i < r.val.length; i++) {
						banner.push({
							img: "https://o.signp.cn/" + r.val[i].images_path,
							title: "",
							link: r.val[i].images_map_gid ? "details" : "",
							mapGid: r.val[i].images_map_gid
						});
					}
					_this.banner = banner;
				} else {
					_this.$http
						.get(_this.apiHost + "/images", {
							params: {
								type: _this.bannerType,
								projectID: _this.$store.state.startPointInfo.project_id,
								timestamp: parseInt(nowTime / 1000)
							}
						})
						.then(function(resp) {
							if (resp.status === 200) {
								const writeStore = _this.$store.state.db
									.transaction("banner", "readwrite")
									.objectStore("banner");
								writeStore.put({
									image_type: _this.bannerType,
									timestamp: nowTime + 300 * 1000,
									val: resp.body
								});
								for (let i = 0; i < resp.body.length; i++) {
									banner.push({
										img: "https://o.signp.cn/" + resp.body[i].images_path,
										title: "",
										link: resp.body[i].images_map_gid ? "details" : "",
										mapGid: resp.body[i].images_map_gid
									});
								}

								_this.banner = banner;
							}
						});
				}
			};
		},
		loadWeather() {
			const weatherTag = "signp-145:weather-" + this.locale;
			const weather = JSON.parse(localStorage.getItem(weatherTag));
			const nowTime = new Date().getTime();
			if (!weather || weather.timestamp < nowTime) {
				this.$http
					.get(this.apiHost + "/weather", {
						params: {
							location: this.$store.state.startPointInfo.weatherLocation,
							lang: this.locale.substring(0, 2)
						}
					})
					.then(
						function(resp) {
							if (resp.status === 200) {
								const timestamp = nowTime + 1800 * 1000;
								const body = JSON.parse(resp.body);
								localStorage.setItem(
									weatherTag,
									JSON.stringify({
										timestamp: timestamp,
										data: body
									})
								);
								this.parseWeather(body);
							}
						},
						function() {}
					);
			} else {
				this.parseWeather(weather.data);
			}
		},
		parseWeather(w) {
			if (w.HeWeather6 && w.HeWeather6.length > 0 && w.HeWeather6[0].now) {
				const now = w.HeWeather6[0].now;
				const wa = [];
				wa.push(now.cond_txt);
				wa.push(now.tmp + "℃");
				wa.push(this.$t("relativeHumidity") + " " + now.hum + "%");
				wa.push(now.wind_dir + " " + now.wind_sc + this.$t("level"));
				this.weatherString = wa.join(" ");
			}
		},
		changeLang(lang) {
			const langTag =
				"signp-" + this.$store.state.startPointInfo.project_id + ":locale";
			const currentLang = localStorage.getItem(langTag);
			if (lang === currentLang) {
				return;
			}
			localStorage.setItem(langTag, lang);
			this.$i18n.locale = lang;
		},
		navPage(path) {
			this.$router.replace("/" + path);
		},
		bannerClick(item, index) {
			if (index === 0) {
				location.href =
					"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MjM5MDYyNjMxNg==&scene=124#wechat_redirect";
				return;
			}
			if (index === 1) {
				location.href = "http://t.cn/A6P1xu21";
				return;
			}
			if (index === 2) {
				location.href = "https://vp.fact.qq.com/home?ADTAG=xw-1.jz";
				return;
			}
			if (index === 3) {
				location.href =
					"https://promo.guahao.com/topic/pneumonia?_cp=jiaotong_zh&cs=share";
				return;
			}
			if (index === 4) {
				location.href = "https://mp.weixin.qq.com/s/2biZ2Jdkb-oar1PjMXl4gg";
				return;
			}
			if (index === 5) {
				this.navPage("article/965");
				return;
			}
			if (!item.link) return;
			this.$router.replace({ path: "/" + item.link + "/" + item.mapGid });
		},
		loadPolygons() {
			this.markerList = [];
			const _this = this;
			const readStore = _this.$store.state.db
				.transaction("mapPolygons")
				.objectStore("mapPolygons")
				.getAll();
			readStore.onsuccess = function(e) {
				const r = e.target.result;
				if (r && r.length > 0) {
					for (let i = 0; i < r.length; i++) {
						r[i].lnglat = _this.changePoint(r[i].point);
						r[i].label = { content: _this.$t(r[i].name) };
						_this.markerList.push(r[i]);
					}
				}
			};
		}
	}
};
</script>
<style scoped>
.v-item-group.v-bottom-navigation .v-btn {
	min-width: 30px;
}
.toMapBtn {
	position: absolute;
	bottom: 70px;
	left: 10px;
	z-index: 3;
}
.amap {
	width: 100% !important;
}
</style>
