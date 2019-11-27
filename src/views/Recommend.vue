<template>
	<v-layout fill-height="">
		<HeaderWithBack title="recommend" :icon="`fa-route`"></HeaderWithBack>
		<v-overlay opacity="1" v-show="fullScreen">
			<v-row no-gutters="" align="start" justify="start">
				<v-col cols="12">
					<v-btn
						@click="
							fullScreen = false;
							fullScreenImage = '';
						"
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
					<!-- <div
						id="panorama"
						:style="
							`height:${$store.state.windowHeight}px;width:${$store.state.windowWidth}px;`
						"
					></div> -->
					<v-img v-if="fullScreenImage" :src="fullScreenImage"></v-img>
				</v-col>
			</v-row>
		</v-overlay>
		<v-container fluid="" class="mt-12">
			<v-row no-gutters="" align="start" justify="start">
				<v-col cols="12">
					<v-skeleton-loader
						:loading="loading.routes"
						transition="scale-transition"
						type="article"
					>
						<v-card flat="">
							<v-tabs
								v-model="tab"
								background-color="white"
								grow=""
								show-arrows=""
							>
								<v-tab
									v-for="(item, index) in routes"
									:key="index"
									:href="`#route-${item.scenic_route_id}`"
								>
									{{ $t(item.title) }}
								</v-tab>
							</v-tabs>

							<v-tabs-items v-model="tab">
								<v-tab-item
									v-for="(i, key) in routes"
									:key="key"
									:value="`route-${i.scenic_route_id}`"
								>
									<img
										v-if="i.scenic_route_image"
										:src="ossHost + i.scenic_route_image"
										width="100%"
										preview="0"
									/>
									<template v-for="(n, k) in i.contents">
										<v-divider
											v-if="k > 0"
											:key="`divider-${k}`"
											class="mt-2"
										></v-divider>
										<v-row no-gutters="" :key="`step-${k}`" align="start">
											<v-col cols="12">
												<v-card flat="">
													<v-list-item class="pl-0" three-line="">
														<v-list-item-content>
															<v-list-item-subtitle class="title"
																><v-btn
																	color="orange  lighten-4"
																	elevation="0"
																	small=""
																	class="subtitle-2 mr-4"
																	>{{ $t("di") }} {{ k + 1 }}
																	{{ $t("zhan") }}</v-btn
																>{{ $t(n.name) }}</v-list-item-subtitle
															>
														</v-list-item-content>
													</v-list-item>
													<v-row
														justify="center"
														v-if="
															n.map_polygon_details_images &&
																n.images &&
																n.images.length > 0
														"
													>
														<v-col cols="8">
															<v-img :src="ossHost + n.images[0]"></v-img
														></v-col>
													</v-row>
													<v-card-text
														v-if="n.map_polygon_details_content"
														v-html="n.map_polygon_details_content[$i18n.locale]"
													>
													</v-card-text>
													<v-card-actions
														><v-spacer></v-spacer
														><v-btn
															depressed=""
															@click="searchSurrounding(n, 'bus')"
															><v-icon left="" dense="">fa-bus</v-icon
															>{{ $t("bus") }}</v-btn
														><v-btn
															depressed=""
															@click="searchSurrounding(n, 'subway')"
															><v-icon left="" dense="">fa-subway</v-icon
															>{{ $t("subway") }}</v-btn
														></v-card-actions
													>
												</v-card>
											</v-col>
										</v-row>
									</template>
									<!-- <template v-for="(n, k) in i.contents">
											<v-stepper-step
												:step="k + 1"
												:key="`step-${k}`"
												color="grey"
											>
												<span class="title deep-orange--text">{{
													$t(n.name)
												}}</span>
												<small>{{ n.address }}</small>
											</v-stepper-step>

											<v-stepper-content :step="k + 1" :key="`content-${k}`">
												<v-expansion-panels>
													<v-expansion-panel>
														<v-expansion-panel-header>{{
															$t("description")
														}}</v-expansion-panel-header>
														<v-expansion-panel-content>
															<v-card-text
																v-html="n.content"
																class="r-content subtitle-1"
															>
															</v-card-text>
														</v-expansion-panel-content>
													</v-expansion-panel>
												</v-expansion-panels>
											</v-stepper-content>
										</template> -->
									<!-- <v-card elevation="1" v-for="(n, k) in i.contents" :key="k">
										<v-card-title class="title deep-orange--text">{{
											$t(n.name)
										}}</v-card-title>
										<v-card-subtitle>{{ n.address }}</v-card-subtitle>
										<v-expansion-panels accordion="" focusable="">
											<v-expansion-panel>
												<v-expansion-panel-header>{{
													$t("description")
												}}</v-expansion-panel-header>
												<v-expansion-panel-content>
													<v-card-text
														v-html="n.content"
														class="r-content subtitle-1"
													>
													</v-card-text>
												</v-expansion-panel-content>
											</v-expansion-panel>
										</v-expansion-panels>
									</v-card> -->
								</v-tab-item>
							</v-tabs-items>
						</v-card>
					</v-skeleton-loader>
				</v-col>
				<v-layout
					fill-height=""
					align-center=""
					justify-center=""
					v-if="loading.fail"
				>
					<v-btn @click="loadRecommendRoutes" depressed="">
						<v-icon left dense="">fa-redo</v-icon>
						<span class="">{{ $t("retry") }}</span>
					</v-btn>
				</v-layout>
			</v-row>
		</v-container>
	</v-layout>
</template>

<script>
export default {
	components: {},
	data() {
		return {
			fullScreen: false,
			fullScreenImage: "",
			showRouteMap: false,
			currentStep: 0,
			expand: false,
			tab: "",
			routes: [],
			loading: {
				routes: true,
				fail: false
			},
			recommendRoutes: false,
			address: {}
		};
	},
	watch: {
		recommendRoutes(val) {
			if (val === true) this.genRoutes();
		}
	},
	mounted() {
		this.loadAddress();
		this.loadRecommendRoutes();
	},
	methods: {
		genRoutes() {
			const _this = this;
			let finished = 0;
			for (let i = 0; i < this.routes.length; i++) {
				const content = this.routes[i].scenic_route_content.split(";");
				this.routes[i].contents = [];
				Promise.mapSeries(content, function(c) {
					const nc = c;
					const ni = i;
					return _this.parseContent(nc, ni);
				}).then(function() {
					finished++;
				});
			}
			const initInterval = setInterval(function() {
				if (finished === _this.routes.length) {
					clearInterval(initInterval);
					_this.tab = "route-" + _this.routes[0].scenic_route_id;
					_this.$previewRefresh();
					_this.loading.routes = false;
				}
			}, 1000);
		},
		parseContent(content, index) {
			const _this = this;
			return new Promise(function(resolve) {
				const newContent = content.split(",");
				const map_gid = newContent[1] + "_" + newContent[2];
				let address = "";
				if (_this.address[map_gid]) {
					address = _this.address[map_gid]["add-" + _this.$i18n.locale];
				}
				const c = {
					address: address
				};
				const readStore = _this.$store.state.db
					.transaction("mapPolygons")
					.objectStore("mapPolygons")
					.get(map_gid);
				readStore.onsuccess = function(e) {
					const r = e.target.result;
					if (r) {
						if (
							!r.map_polygon_details_content ||
							r.map_polygon_details_content[_this.$i18n.locale] === ""
						) {
							_this.$http
								.get(_this.apiHost + "/polygon/details", {
									params: {
										map_gid: map_gid,
										project_id: _this.$store.state.startPointInfo.project_id,
										timestamp: parseInt(new Date().getTime() / 1000)
									}
								})
								.then(
									function(resp) {
										if (resp.status === 200) {
											for (let i in resp.body) {
												if (i.indexOf("map_polygon_details") === 0) {
													if (
														i === "map_polygon_details_voice" ||
														i === "map_polygon_details_content"
													) {
														r[i] = JSON.parse(resp.body[i]);
													} else if (i === "map_polygon_details_images") {
														if (resp.body[i]) {
															r[i] = resp.body[i];
															r["images"] = resp.body[i].split(",");
														}
													} else {
														r[i] = resp.body[i];
													}
												}
											}
											const writePolygonStore = _this.$store.state.db
												.transaction("mapPolygons", "readwrite")
												.objectStore("mapPolygons");
											writePolygonStore.put(r);
											_this.routes[index].contents.push(Object.assign(c, r));
											resolve();
										}
									},
									function() {
										_this.routes[index].contents.push(Object.assign(c, r));
										resolve();
									}
								);
						} else {
							_this.routes[index].contents.push(Object.assign(c, r));
							resolve();
						}
					} else {
						_this.routes[index].contents.push(Object.assign(c, r));
						resolve();
					}
				};
				readStore.onerror = function() {
					_this.routes[index].contents.push(c);
					resolve();
				};
			});
		},
		loadRecommendRoutes() {
			this.recommendRoutes = false;
			const _this = this;
			const readStore = _this.$store.state.db
				.transaction("recommentRoutes")
				.objectStore("recommentRoutes")
				.get(_this.$store.state.startPointInfo.scenicRouteCategory);
			readStore.onsuccess = function(e) {
				const r = e.target.result;
				const nowTime = new Date().getTime();
				if (r && r.timestamp > nowTime && r.val.length > 0) {
					for (let i = 0; i < r.val.length; i++) {
						const e = r.val[i];
						e.title = e.scenic_route_name;
						_this.routes.push(e);
					}
					_this.recommendRoutes = true;
				} else {
					_this.$http
						.get(_this.apiHost + "/project/scenic-routes", {
							params: {
								category_id:
									_this.$store.state.startPointInfo.scenicRouteCategory,
								project_id: _this.$store.state.startPointInfo.project_id,
								timestamp: parseInt(new Date().getTime() / 1000)
							}
						})
						.then(
							function(resp) {
								console.log(resp);
								if (resp.status === 200) {
									const timestamp = new Date().getTime() + 300 * 1000;
									const writeStore = _this.$store.state.db
										.transaction("recommentRoutes", "readwrite")
										.objectStore("recommentRoutes");
									writeStore.put({
										scenic_category_id:
											_this.$store.state.startPointInfo.scenicRouteCategory,
										timestamp: timestamp,
										val: resp.body
									});

									for (let i = 0; i < resp.body.length; i++) {
										const e = resp.body[i];
										e.title = e.scenic_route_name;
										_this.routes.push(e);
									}
									_this.recommendRoutes = true;
								} else {
									_this.loading.fail = true;
								}
							},
							function() {
								_this.loading.fail = true;
							}
						);
				}
			};
		},
		loadAddress() {
			const _this = this;
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
			};
		},
		searchSurrounding(item, text) {
			const details = item;
			details.keywords = text;
			details.icon = "fa-" + text;
			this.$store.commit("updateSurrounding", details);
			this.$router.replace("/attractionSurrounding");
		},
		showFullScreenImage(image) {
			this.fullScreenImage = image;
			this.fullScreen = true;
		}
	}
};
</script>
<style>
.r-content img {
	width: 100% !important;
}
/* .v-expansion-panel::before {
	box-shadow: none !important;
} */
/* .v-expansion-panel-content__wrap {
	padding: 0 !important;
} */
/* .v-timeline--dense:not(.v-timeline--reverse):before {
	left: calc(36px - 1px) !important;
}
.v-timeline-item__divider {
	min-width: 70px !important;
}
.v-timeline-item__body {
	max-width: calc(100% - 70px) !important;
} */
</style>
