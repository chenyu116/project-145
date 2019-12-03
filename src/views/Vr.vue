<template>
	<v-layout fill-height="">
		<HeaderWithBack title="vr" icon="fa-file-alt"></HeaderWithBack>
		<v-overlay opacity="1" v-if="panoramaFullScreen && showPanorama">
			<v-row no-gutters="" align="start" justify="start">
				<v-col cols="12">
					<v-btn
						@click="
							panoramaFullScreen = false;
							showPanorama = '';
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
					<v-pannellum
						:style="
							`height:${$store.state.windowHeight}px;width:${$store.state.windowWidth}px;`
						"
						:src="showPanorama"
					></v-pannellum>
				</v-col>
			</v-row>
		</v-overlay>
		<v-row class="mt-12">
			<v-col cols="12" sm="6" offset-sm="3">
				<v-card flat="">
					<v-card-subtitle>{{ $t("pressImageToView") }}</v-card-subtitle>
					<v-skeleton-loader
						:loading="loading.full"
						transition="scale-transition"
						type="article"
						style="background:rgba(0,0,0,0)"
					>
						<v-container fluid>
							<v-row>
								<v-col v-for="(item, index) in panorama" :key="index" cols="6">
									<v-card
										outlined=""
										v-if="item.img"
										@click="showPanoramaView(item.img)"
									>
										<v-img
											:src="
												`${ossHost + item.img}?x-oss-process=style/s200x100`
											"
											class="grey lighten-2 align-end"
										>
											<template v-slot:placeholder>
												<v-row
													class="fill-height ma-0"
													align="center"
													justify="center"
												>
													<v-progress-circular
														indeterminate
														color="grey lighten-5"
													></v-progress-circular>
												</v-row>
											</template>
										</v-img>
										<v-card-actions class="subtitle-2 text-center"
											><span v-if="polygons[item.map_gid]">{{
												$t(polygons[item.map_gid].name)
											}}</span></v-card-actions
										>
									</v-card>
								</v-col>
							</v-row>
						</v-container>
					</v-skeleton-loader>
				</v-card>
			</v-col>
		</v-row>
	</v-layout>
</template>

<script>
export default {
	components: {},
	mounted() {
		this.loadPolygons();
	},
	data() {
		return {
			loading: {
				full: false
			},
			details: {},
			showPanorama: "",
			panorama: [],
			panoramaFullScreen: false,
			polygons: {}
		};
	},
	methods: {
		loadPanorama() {
			const _this = this;
			const readStore = _this.$store.state.db
				.transaction("panorama")
				.objectStore("panorama")
				.get(_this.$store.state.startPointInfo.project_id);
			readStore.onsuccess = function(e) {
				const r = e.target.result;
				const nowTime = new Date().getTime();
				if (r && r.timestamp > nowTime) {
					const panorama = [];
					for (let i = 0; i < r.val.length; i++) {
						if (!r.val[i].map_polygon_details_panorama) continue;
						r.val[i].map_polygon_details_panorama
							.split(",")
							.forEach(function(v) {
								const it = { map_gid: r.val[i].map_gid, img: v };
								panorama.push(it);
							});
					}
					_this.panorama = panorama;
					_this.loading.full = false;
				} else {
					_this.$http
						.get(_this.apiHost + "/project/panorama", {
							params: {
								project_id: _this.$store.state.startPointInfo.project_id,
								timestamp: parseInt(new Date().getTime() / 1000)
							}
						})
						.then(
							function(resp) {
								if (resp.status === 200 && resp.body) {
									const timestamp = new Date().getTime() + 300 * 1000;
									const writeStore = _this.$store.state.db
										.transaction("panorama", "readwrite")
										.objectStore("panorama");
									writeStore.put({
										project_id: _this.$store.state.startPointInfo.project_id,
										timestamp: timestamp,
										val: resp.body
									});
									const panorama = [];

									for (let i = 0; i < resp.body.length; i++) {
										if (!resp.body[i].map_polygon_details_panorama) continue;
										resp.body[i].map_polygon_details_panorama
											.split(",")
											.forEach(function(v) {
												const it = { map_gid: resp.body[i].map_gid, img: v };
												panorama.push(it);
											});
									}
									_this.panorama = panorama;
								}
								_this.loading.full = false;
							},
							function() {
								_this.loading.full = false;
							}
						);
				}
			};
		},
		loadPolygons() {
			const _this = this;
			_this.loading.full = true;
			const readStore = _this.$store.state.db
				.transaction("mapPolygons")
				.objectStore("mapPolygons")
				.getAll();
			readStore.onsuccess = function(e) {
				const r = e.target.result;
				if (r && r.length > 0) {
					for (let i = 0; i < r.length; i++) {
						_this.polygons[r[i].map_gid] = r[i];
					}
				}
				_this.loadPanorama();
			};
			readStore.onerror = function() {
				_this.loadPanorama();
			};
		},
		showPanoramaView(image) {
			this.showPanorama = this.ossHost + image + "?v=" + new Date().getTime();
			/*if (this.panoramaView["viewer"] !== undefined) {
				this.panoramaView["viewer"].destroy();
				delete this.panoramaView["viewer"];
			}
			const viewerConfig = {
				showFullscreenCtrl: false,
				orientationOnByDefault: false,
				type: "equirectangular",
				panorama: image,
				autoLoad: true,
				showControls: true,
				showZoomCtrl: false,
				minPitch: -60,
				hfov: 100,
				pitch: 0,
				yaw: 0
			};

			this.panoramaView["viewer"] = window.pannellum.viewer(
				"panorama",
				viewerConfig
			);*/
			this.panoramaFullScreen = true;
		}
	}
};
</script>
<style scoped></style>
