<template>
	<div
		class="initBg"
		:style="
			`background:url(${bgUrl}) no-repeat;background-size: 100%;height:${$store.state.windowHeight}px;width:${$store.state.windowWidth}px;`
		"
	>
		<v-layout fill-height="" align-end="" justify-center="">
			<!-- <v-dialog v-model="show" persistent> -->
			<v-col cols="12" v-show="retry" class="deep-orange">
				<p class="subtitle-2 full-width text-center">
					{{ err.text }}
				</p>
				<v-btn @click="initData" color="deep-orange" block depressed="">
					<v-icon left dense="">fa-redo</v-icon>
					<span class="">{{ $t("retry") }}</span>
				</v-btn>
			</v-col>
			<v-col cols="11" v-if="!retry" flat="">
				<v-progress-linear
					:active="true"
					:background-opacity="0.4"
					:buffer-value="100"
					:height="20"
					:indeterminate="false"
					:value="value"
					color="primary"
					rounded=""
					class="subtitle-2 full-width text-center white--text
              font-weight-medium mb-1"
					>{{ value }} %</v-progress-linear
				>
			</v-col>
			<!-- </v-dialog> -->
		</v-layout>
	</div>
</template>

<script>
export default {
	computed: {
		bgUrl() {
			return this.$store.state.startPointInfo.slogon;
		}
	},
	data: () => ({
		show: true,
		retry: false,
		total: 0,
		finished: 0,
		value: 0,
		err: {
			text: "",
			retry: false
		},
		categoryIds: [],
		list: [],
		address: {}
	}),
	mounted() {
		this.initData();
	},
	watch: {
		finished(val) {
			this.value = parseInt((val / this.total) * 100);
		}
	},
	methods: {
		genErr(text, retry = true) {
			return { text: text, retry: retry };
		},
		initData() {
			this.retry = false;
			this.finished = 0;
			const initFunc = [
				this.initIndexedDB,
				this.initLanguage,
				this.initCategoryAll,
				this.initMapPolygon,
				this.initPolygonAddressZh,
				this.initPolygonAddressEn,
				this.initWxSpeech
			];
			let inProgress = false;
			const maxRetryTimes = 3;
			let retryTimes = 0;
			this.total = initFunc.length;
			const _this = this;
			const initInterval = setInterval(function() {
				if (retryTimes == maxRetryTimes) {
					clearInterval(initInterval);
					_this.retry = true;
					return;
				}
				if (!inProgress) {
					inProgress = true;
					Promise.mapSeries(
						initFunc,
						function(f) {
							return f();
						},
						{ concurrency: 1 }
					)
						.then(function() {
							clearInterval(initInterval);
							setTimeout(function() {
								_this.$store.commit("updateDataLoaded", true);
								_this.$router.replace("/");
							}, 600);
						})
						.catch(function(err) {
							_this.err = err;
							if (err.retry) {
								retryTimes++;
								_this.finished = 0;
								inProgress = false;
							} else {
								clearInterval(initInterval);
								_this.retry = true;
							}
						});
				}
			}, 1000);
		},
		initIndexedDB() {
			const _this = this;
			return new Promise(function(resolve, reject) {
				const indexedDB =
					window.indexedDB ||
					window.msIndexedDB ||
					window.mozIndexedDB ||
					window.webkitIndexedDB;
				if (!indexedDB) {
					return reject(_this.genErr("不支持 IndexedDB", false));
				}
				const localDBVersion = parseInt(
					localStorage.getItem(
						"signp-" +
							_this.$store.state.startPointInfo.project_id +
							":dbVersion"
					)
				);
				let newDBVersion = parseInt(
					_this.$store.state.startPointInfo.dbVersion
				);
				newDBVersion = isNaN(newDBVersion) ? 1 : newDBVersion;
				if (isNaN(localDBVersion) || localDBVersion !== newDBVersion) {
					indexedDB.deleteDatabase(
						"signp-" + _this.$store.state.startPointInfo.project_id
					);
					localStorage.setItem(
						"signp-" +
							_this.$store.state.startPointInfo.project_id +
							":dbVersion",
						newDBVersion
					);
					location.reload();
				}
				if (_this.$store.state.db) {
					_this.finished++;
					resolve();
					return;
				}

				try {
					const openRequest = indexedDB.open(
						"signp-" + _this.$store.state.startPointInfo.project_id,
						newDBVersion
					);
					openRequest.onupgradeneeded = function(e) {
						const _db = e.target.result;
						_db.createObjectStore("mapPolygons", { keyPath: "map_gid" });
						_db.createObjectStore("mapPolygonAddress", { keyPath: "map_gid" });
						_db.createObjectStore("events", { keyPath: "map_gid" });
						_db.createObjectStore("recommentRoutes", {
							keyPath: "scenic_category_id"
						});
						_db.createObjectStore("language", { keyPath: "locale" });
						_db.createObjectStore("banner", { keyPath: "image_type" });
						_db.createObjectStore("articles", {
							keyPath: "article_category_id"
						});
						_db.createObjectStore("article", {
							keyPath: "id"
						});
						_db.createObjectStore("mapCategory", {
							keyPath: "map_polygon_category_id"
						});
						_db.createObjectStore("mapCategoryPolygon", {
							keyPath: "map_polygon_category_id"
						});
					};
					openRequest.onsuccess = function(e) {
						_this.$store.commit("initDB", e.target.result);
						_this.finished++;
						resolve();
					};
					openRequest.onerror = function() {
						reject(_this.genErr("IndexedDB 初始化失败", false));
					};
				} catch (err) {
					reject(_this.genErr("IndexedDB 初始化失败", false));
				}
			});
		},
		initCategoryAll() {
			const _this = this;
			_this.categoryIds = [];
			return new Promise(function(resolve, reject) {
				const readStore = _this.$store.state.db
					.transaction("mapCategory")
					.objectStore("mapCategory")
					.getAll();
				readStore.onsuccess = function(e) {
					const r = e.target.result;
					if (r && r.length > 0) {
						for (let i = 0; i < r.length; i++) {
							_this.categoryIds.push(r[i].map_polygon_category_id);
						}
						_this.finished++;
						resolve();
					} else {
						_this.$http
							.get(_this.apiHost + "/category/all", {
								params: {
									projectID: _this.$store.state.startPointInfo.project_id,
									timestamp: parseInt(new Date().getTime() / 1000)
								}
							})
							.then(function(resp) {
								if (resp.status === 200) {
									const writeStore = _this.$store.state.db
										.transaction("mapCategory", "readwrite")
										.objectStore("mapCategory");
									for (let i = 0; i < resp.body.length; i++) {
										writeStore.put(resp.body[i]);
										_this.categoryIds.push(
											resp.body[i].map_polygon_category_id
										);
									}
									_this.finished++;
									resolve();
								} else {
									reject(_this.genErr("读取分类信息失败"));
								}
							})
							.catch(function() {
								reject(_this.genErr("读取分类信息失败"));
							});
					}
				};
				readStore.onerror = function() {
					reject(_this.genErr("读取分类信息失败"));
				};
			});
		},
		initMapPolygon() {
			const _this = this;
			return new Promise(function(resolve, reject) {
				const readStore = _this.$store.state.db
					.transaction("mapPolygons")
					.objectStore("mapPolygons")
					.getAll();
				readStore.onsuccess = function(e) {
					const r = e.target.result;
					if (r && r.length > 0) {
						_this.list = r;
						_this.finished++;
						resolve();
					} else {
						if (_this.categoryIds.length > 0) {
							_this.$http
								.get(_this.apiHost + "/category/ids", {
									params: {
										categoryIDs: _this.categoryIds.join(","),
										projectID: _this.$store.state.startPointInfo.project_id,
										timestamp: parseInt(new Date().getTime() / 1000)
									}
								})
								.then(function(resp) {
									if (resp.status === 200 && resp.body) {
										const writeStore = _this.$store.state.db
											.transaction("mapPolygons", "readwrite")
											.objectStore("mapPolygons");
										const writeCategoryPolygonStore = _this.$store.state.db
											.transaction("mapCategoryPolygon", "readwrite")
											.objectStore("mapCategoryPolygon");
										for (let i in resp.body) {
											writeCategoryPolygonStore.put({
												map_polygon_category_id: i,
												val: resp.body[i]
											});
											for (let x = 0; x < resp.body[i].length; x++) {
												writeStore.put(resp.body[i][x]);
												_this.list.push(resp.body[i][x]);
											}
										}
										_this.finished++;
										resolve();
									} else {
										reject(_this.genErr("读取点位信息失败"));
									}
								})
								.catch(function() {
									reject(_this.genErr("读取点位信息失败"));
								});
						} else {
							reject(_this.genErr("读取点位信息失败"));
						}
					}
				};
				readStore.onerror = function() {
					reject(_this.genErr("读取点位信息失败"));
				};
			});
		},
		initLanguage() {
			const _this = this;
			return new Promise(function(resolve, reject) {
				const readStore = _this.$store.state.db
					.transaction("language")
					.objectStore("language")
					.getAll();
				readStore.onsuccess = function(e) {
					const r = e.target.result;
					if (r && r.length > 0) {
						resolve(r);
					} else {
						_this.$http
							.get(_this.apiHost + "/language", {
								params: {
									project_id: _this.$store.state.startPointInfo.project_id,
									timestamp: parseInt(new Date().getTime() / 1000)
								}
							})
							.then(function(resp) {
								if (resp.status === 200 && resp.body) {
									const writeStore = _this.$store.state.db
										.transaction("language", "readwrite")
										.objectStore("language");
									const lang = {};
									for (let i = 0; i < resp.body.length; i++) {
										if (!lang[resp.body[i].language_locale])
											lang[resp.body[i].language_locale] = {};
										lang[resp.body[i].language_locale][
											resp.body[i].language_key
										] = resp.body[i].language_value;
									}
									const res = [];
									for (let locale in lang) {
										const l = {
											locale: locale,
											val: lang[locale]
										};
										writeStore.put(l);
										res.push(l);
									}
									resolve(res);
								} else {
									reject(_this.genErr("读取语言包失败"));
								}
							})
							.catch(function() {
								reject(_this.genErr("读取语言包失败"));
							});
					}
				};
				readStore.onerror = function() {
					reject(_this.genErr("读取语言包失败"));
				};
			}).then(function(res) {
				for (let i = 0; i < res.length; i++) {
					_this.$i18n.setLocaleMessage(res[i].locale, res[i].val);
				}
				let savedLang = localStorage.getItem(
					"signp-" + _this.$store.state.startPointInfo.project_id + ":locale"
				);
				if (!savedLang) savedLang = "zh_CN";
				_this.$i18n.locale = savedLang;
				_this.finished++;
				return Promise.resolve();
			});
		},
		initPolygonAddressZh() {
			const lang = "zh_CN";
			return this.loadAddress(lang);
		},
		initPolygonAddressEn() {
			const lang = "en_US";
			return this.loadAddress(lang);
		},
		loadAddress(lang) {
			const _this = this;
			const searchLang = lang === "zh_CN" ? "zh_cn" : "en";
			return new Promise(function(resolve) {
				const readAddressStore = _this.$store.state.db
					.transaction("mapPolygonAddress")
					.objectStore("mapPolygonAddress")
					.getAll();
				readAddressStore.onsuccess = function(e) {
					const r = e.target.result;
					if (r && r.length > 0) {
						for (let i = 0; i < r.length; i++) {
							_this.address[r[i].map_gid] = r[i];
						}
					}
					const waitList = [];
					for (let i = 0; i < _this.list.length; i++) {
						if (
							_this.address[_this.list[i].map_gid] &&
							_this.address[_this.list[i].map_gid]["add-" + lang]
						)
							continue;
						const p = _this.address[_this.list[i].map_gid]
							? _this.address[_this.list[i].map_gid]
							: { map_gid: _this.list[i].map_gid };
						p.point = _this.changePoint(_this.list[i].point);
						waitList.push(p);
					}
					if (waitList.length > 0) {
						const geocoder = new window.AMap.Geocoder({
							lang: searchLang,
							radius: 1000,
							extensions: "base"
						});
						Promise.map(
							waitList,
							function(p) {
								const _p = p;
								return _this
									.getPolygonAddress(_p.point, geocoder)
									.then(function(resp) {
										_p["add-" + lang] = resp;
										_this.address[_p.map_gid] = _p;
									});
							},
							{ concurrency: 3 }
						).then(
							function() {
								const writeAddressStore = _this.$store.state.db
									.transaction("mapPolygonAddress", "readwrite")
									.objectStore("mapPolygonAddress");
								for (let i in _this.address) {
									writeAddressStore.put(_this.address[i]);
								}
								_this.finished++;
								resolve();
							},
							function() {
								_this.finished++;
								resolve();
							}
						);
					} else {
						_this.finished++;
						resolve();
					}
				};
			});
		},
		getPolygonAddress(lngLat, geocoder) {
			return new Promise(function(resolve, reject) {
				const addressTimeout = setTimeout(function() {
					reject();
				}, 5000);
				geocoder.getAddress(lngLat, function(status, result) {
					if (status === "complete" && result.info === "OK") {
						clearTimeout(addressTimeout);
						if (result && result.regeocode) {
							resolve(result.regeocode.formattedAddress);
						}
					}
				});
			});
		},
		initWxSpeech() {
			const _this = this;
			return new Promise(function(resolve) {
				if (_this.$store.state.isWx) {
					_this.$wechat.wx.ready(function() {
						_this.$wechat.wx.startRecord();
						setTimeout(function() {
							_this.$wechat.wx.stopRecord();
						}, 1000);
						_this.finished++;
						resolve();
					});
					_this.$wechat.wx.error(function() {
						_this.finished++;
						resolve();
					});
				} else {
					_this.finished++;
					resolve();
				}
			});
		}
	}
};
</script>
