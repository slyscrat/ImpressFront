<template>
    <div>

    </div>
</template>

<script>
	//import UserEventContainer from "@/components/common/events/UserEventContainer";
	/*import {API_SERVER_PATH} from "@/utils/constants";
	import axios from "axios";*/

	export default {
		name: "MovieContainer",
        props: ['type','items'],
		data() {
			return {
				user: {},
				fetchError: ''
			}
		},
		//components: {UserEventContainer},
		mounted() {
		}
	}
</script>

<style scoped>

</style>
