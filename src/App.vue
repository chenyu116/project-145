<template>
	<v-app v-resize="onResize">
		<Init v-if="!$store.state.dataLoaded" />
		<v-content v-if="$store.state.dataLoaded">
			<router-view />
		</v-content>
		<v-bottom-sheet v-model="showSocketMessage" persistent="">
			<v-card flat="" max-height="180">
				<v-list-item three-line>
					<v-list-item-content>
						<v-list-item-title :class="`title mb-1 ${msg.titleColor}`">{{
							msg.title
						}}</v-list-item-title>
						<span class="subtitle-1" v-html="msg.content"></span>
					</v-list-item-content>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn
							color="red darken-4"
							icon
							@click="showSocketMessage = !showSocketMessage"
							><v-icon>fa-times</v-icon></v-btn
						>
					</v-card-actions>
					<!-- <v-list-item-avatar tile size="80" color="grey"
						><v-img
							:src="ossHost + currentDetails.map_polygon_description_thumbnail"
						></v-img
					></v-list-item-avatar> -->
				</v-list-item>
			</v-card>
		</v-bottom-sheet>
	</v-app>
</template>

<script>
import Init from "./components/Init.vue";

export default {
	name: "App",

	components: {
		Init
	},
	computed: {
		socketMessage() {
			return this.$store.state.socketMessage;
		}
	},
	watch: {
		socketMessage(val) {
			this.showSocketMessage = false;
			this.parseMessage(val);
		},
		showSocketMessage(val) {
			if (val === false) {
				clearTimeout(this.messageTimeout);
				this.msg = {};
			}
		}
	},
	data: () => ({
		messageTimeout: null,
		showSocketMessage: false,
		msg: {}
	}),
	methods: {
		onResize() {
			this.$store.commit("updateWindowWidth", window.innerWidth);
			this.$store.commit("updateWindowHeight", window.innerHeight);
		},
		parseMessage(msg) {
			const _this = this;
			clearTimeout(this.messageTimeout);
			switch (msg.cmd) {
				case "notice":
					const content = msg.content.split("\n");
					const title = msg.title.split("\n");
					this.msg.title = title[0];
					this.msg.content = content[0];
					if (this.$i18n.locale !== "zh_CN" && title[1] && content[1]) {
						this.msg.title = title[1];
						this.msg.content = content[1];
					}
					this.msg.titleColor = "grey--text";
					if (msg.level === "1") {
						this.msg.titleColor = "deep-orange--text";
					}
					if (msg.timeout) {
						const timeout = parseInt(msg.timeout);
						if (timeout > 0) {
							this.messageTimeout = setTimeout(function() {
								clearTimeout(_this.messageTimeout);
								_this.showSocketMessage = false;
							}, timeout * 1000);
						}
					}
					this.showSocketMessage = true;
					break;
				case "evacuate":
					this.msg.title = this.$t("evacuate");
					this.msg.content = msg.text;
					this.msg.titleColor = "red--text";
					this.showSocketMessage = true;
					break;
			}
		}
	}
};
</script>
<style>
.v-application {
	background: #fff !important;
}
* {
	text-transform: none !important;
}
.amap-logo {
	z-index: 1 !important;
}
</style>
