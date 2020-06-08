<template>
    <div v-if="isShow">
        <span v-if="this.searchData">
            Результаты поиска по запросу: '{{this.searchData}}'
        </span>
        <ul id="item-container">
            <li :key="i.id" v-for="i in items">
                <itemComponent :item="i" @openItem="openItem" @popUp="popUp"/>
            </li>
        </ul>
    </div>
</template>

<script>
    // TODO : insert popUp
    import itemComponent from '@/components/movie/ItemComponent';
	export default {
		name: "ItemContainer",
        props: ['render', 'items', 'searchData'],
        components: {
            itemComponent
        },
		data() {
			return {
                isShow: true,
				fetchError: ''
			}
		},
        watch: {
            render: function() {
                this.isShow = this.render;
            },
            items: function() {
                // TODO
                console.log('ITEMS');
            },
            searchData: function() {
                // TODO
                console.log('SEARCH');
                console.log(this.searchData);
            }
        },
        methods: {
            openItem(id) {
                this.$emit('openItem', id);
            },
            popUp() {
                console.log('Insert PopUp');
            }
        },
		mounted() {
		}
	}
</script>

<style scoped>

</style>
