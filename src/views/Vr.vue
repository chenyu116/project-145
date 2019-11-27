<template>
	<v-layout fill-height="">
		<HeaderWithBack title="vr" icon="fa-file-alt"></HeaderWithBack>
		<v-overlay opacity="1" v-show="panoramaFullScreen">
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
					<!-- <div
						id="panorama"
						:style="
							`height:${$store.state.windowHeight}px;width:${$store.state.windowWidth}px;`
						"
					></div> -->
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
					<v-container fluid>
						<v-row>
							<v-col
								v-for="(item, index) in panorama"
								:key="index"
								class="d-flex child-flex"
								cols="4"
							>
								<v-card flat tile class="d-flex">
									<v-img
										:src="`${ossHost + item}?x-oss-process=style/s100`"
										aspect-ratio="1"
										class="grey lighten-2"
										@click="showPanoramaView(item)"
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
								</v-card>
							</v-col>
						</v-row>
					</v-container>
				</v-card>
			</v-col>
		</v-row>
		<!-- <v-container fluid="" class="mt-12">
			<v-row no-gutters="">
				<v-col cols="12">
					<v-card flat="">
						<template v-if="!loading.fail">
							<v-skeleton-loader :loading="loading.content" type="article">
								<v-col cols="12" v-show="panorama.length > 0">
									<v-card-subtitle class="subtitle-1 font-weight-bold"
										><v-icon left dense="" color="lime lighten-3"
											>fa-bookmark</v-icon
										>{{ $t("panorama360") }}</v-card-subtitle
									>
									<v-card-subtitle>{{
										$t("pressImageToView")
									}}</v-card-subtitle>
									<template v-for="(item, index) in panorama">
										<img
											:key="index"
											:src="ossHost + item"
											class="point-details-gallery-panorama"
											@click="showPanoramaView(item)"
										/>
									</template>
								</v-col> </v-skeleton-loader
						></template>
					</v-card>
				</v-col>
			</v-row>
			<v-layout
				fill-height=""
				align-center=""
				justify-center=""
				v-if="loading.fail"
			>
				<v-btn @click="loadPanorama" depressed="">
					<v-icon left dense="">fa-redo</v-icon>
					<span class="">{{ $t("regry") }}</span>
				</v-btn>
			</v-layout>
		</v-container> -->
	</v-layout>
</template>

<script>
export default {
	components: {},
	mounted() {
		this.loadPanorama();
	},
	data() {
		return {
			loading: {
				content: true,
				fail: false
			},
			details: {},
			showPanorama: "",
			panorama: [],
			panoramaFullScreen: false
		};
	},
	methods: {
		loadPanorama() {
			const _this = this;
			_this.loading.fail = false;
			_this.loading.content = true;
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
								panorama.push(v);
							});
					}
					_this.panorama = panorama;
					_this.loading.content = false;
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
												panorama.push(v);
											});
									}
									_this.panorama = panorama;
									_this.loading.content = false;
								} else {
									_this.loading.fail = true;
								}
							},
							function() {
								_this.loading.fail = true;
								_this.loading.content = false;
							}
						);
				}
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
<style scoped>
.point-details-gallery-panorama {
	width: 6em;
	height: 3.5em;
	margin-left: 0.8em;
}
</style>
