<template>
	<v-layout fill-height="">
		<HeaderWithBack title="details" icon="fa-file-alt"></HeaderWithBack>
		<v-container fluid="" class="mt-12">
			<v-row no-gutters="" align="start" justify="center">
				<v-col cols="12">
					<v-card flat="">
						<template v-if="!loading.fail">
							<v-skeleton-loader :loading="loading.content" type="article">
								<v-card-title>{{ details.article_title }}</v-card-title>
								<v-divider></v-divider>
								<v-card-text
									v-html="details.article_content"
									class="r-content subtitle-1"
								></v-card-text> </v-skeleton-loader
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
				<v-btn @click="loadArticle(id)" depressed="">
					<v-icon left dense="">fa-redo</v-icon>
					<span class="">{{ $t("retry") }}</span>
				</v-btn>
			</v-layout>
		</v-container>
	</v-layout>
</template>

<script>
export default {
	components: {},
	computed: {
		id() {
			return this.$route.params.id;
		}
	},
	watch: {
		id(val) {
			console.log("watch id", val);
			if (!val) return;
			this.loadArticle(val);
		}
	},
	mounted() {
		this.loadArticle(this.id);
	},
	data() {
		return {
			loading: {
				content: true,
				fail: false
			},
			details: {
				title: "",
				category_name: "",
				content: ""
			}
		};
	},
	methods: {
		loadArticle(id) {
			const _this = this;
			_this.loading.fail = false;
			_this.loading.content = true;
			const readStore = _this.$store.state.db
				.transaction("article")
				.objectStore("article")
				.get(id);
			readStore.onsuccess = function(e) {
				const r = e.target.result;
				const nowTime = new Date().getTime();
				if (r && r.timestamp > nowTime) {
					_this.details = r.val;
					_this.loading.content = false;
				} else {
					_this.$http
						.get(_this.apiHost + "/article", {
							params: {
								id: id,
								project_id: _this.$store.state.startPointInfo.project_id,
								timestamp: parseInt(new Date().getTime() / 1000)
							}
						})
						.then(
							function(resp) {
								console.log(resp);
								if (resp.status === 200 && resp.body) {
									const timestamp = new Date().getTime() + 300 * 1000;
									const writeStore = _this.$store.state.db
										.transaction("article", "readwrite")
										.objectStore("article");
									writeStore.put({
										id: id,
										timestamp: timestamp,
										val: resp.body
									});
									_this.details = resp.body;
								} else {
									_this.loading.fail = true;
								}
								_this.loading.content = false;
							},
							function() {
								_this.loading.fail = true;
								_this.loading.content = false;
							}
						);
				}
			};
		}
	}
};
</script>
<style>
.r-content img {
	width: 100% !important;
}
</style>
