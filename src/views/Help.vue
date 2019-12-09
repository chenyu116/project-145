<template>
	<v-layout fill-height="">
		<HeaderWithBack title="help" :icon="`fa-info-circle`"></HeaderWithBack>
		<v-row no-gutters="" align="start" justify="center" class=" mt-12">
			<v-col cols="12">
				<v-list one-line>
					<v-list-item href="tel:8602081078250">
						<v-list-item-icon>
							<v-icon color="red">fa-exclamation-triangle</v-icon>
						</v-list-item-icon>
						<v-list-item-content>
							<v-list-item-title class="red--text">{{
								$t("emergencyRescue")
							}}</v-list-item-title>
						</v-list-item-content>
						<v-list-item-action class="red--text subtitle-2"
							>+86-020-81078250</v-list-item-action
						>
					</v-list-item>
					<template v-for="(item, index) in list">
						<v-divider inset="" :key="`divider-${index}`"></v-divider>
						<v-list-item :href="item.href" :key="index">
							<v-list-item-icon>
								<!-- <v-icon :color="item.color" dense="">{{ item.icon }}</v-icon> -->
							</v-list-item-icon>
							<v-list-item-content>
								<v-list-item-title>{{ $t(item.text) }}</v-list-item-title>
							</v-list-item-content>
							<v-list-item-action class="subtitle-2"
								>{{ item.sub }}
							</v-list-item-action>
							<v-list-item-icon v-if="item.qrcode">
								<img
									:src="ossHost + item.qrcode"
									width="40"
									height="40"
									preview="0"
								/>
							</v-list-item-icon>
						</v-list-item>
					</template>
					<v-subheader
						><v-icon class="mr-6" color="primary">fa-exclamation</v-icon
						>{{ $t("pressTheNumberToDial") }}</v-subheader
					>
				</v-list></v-col
			>
		</v-row>
	</v-layout>
</template>

<script>
export default {
	components: {},
	data() {
		return {
			list: [
				{
					text: "wechatNumber",
					icon: "fa-comments",
					color: "indigo",
					sub: "越秀区",
					qrcode: "project/145/wechatQrcode.png"
				},
				{
					text: "travelAdvisory",
					icon: "fa-question-circle",
					color: "indigo",
					href: "tel:8602081078225",
					sub: "+86-020-81078225"
				},
				{
					text: "police",
					icon: "fa-user-shield",
					color: "red lighten-3",
					href: "tel:86110",
					sub: "+86-110"
				},
				{
					text: "firstAid",
					icon: "fa-user-shield",
					color: "red lighten-3",
					href: "tel:86120",
					sub: "+86-120"
				},
				{
					text: "fireAlarm",
					icon: "fa-user-shield",
					color: "red lighten-3",
					href: "tel:86119",
					sub: "+86-119"
				},
				{
					text: "tourismSupervision",
					icon: "fa-star",
					color: "indigo",
					href: "tel:8612301",
					sub: "+86-12301"
				},
				{
					text: "travelReport",
					icon: "fa-star",
					color: "indigo",
					href: "tel:8612345",
					sub: "+86-12345"
				}
			]
		};
	},
	mounted() {
		this.$previewRefresh();
	},
	methods: {}
};
</script>
