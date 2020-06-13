<template>
    <div v-if="isShow">
        <div id="words">
            <span v-if="this.innerMessage">
                {{this.innerMessage}}
            </span>
            <span v-if="this.innerSearch && $router.history.getCurrentLocation().includes('search')">Результаты поиска по запросу: '{{this.innerSearch}}'</span>
            <b-spinner label="Spinning" type="grow" variant="primary" id="spinner"
                       v-if="items.length === 0 && $router.history.getCurrentLocation().includes('/recommend') && !innerMessage" />
        </div>
        <ul>
            <li :key="i.id" v-for="i in items">
                <itemComponent :item="i" @openItem="openItem" @popUp="popUp" @fut="fut" @rat="rat"/>
            </li>
        </ul>
    </div>
</template>

<script>
    import itemComponent from '@/components/common/item/ItemComponent';

    export default {
		name: "ItemContainer",
        props: ['render', 'items', 'searchData', 'message'],
        components: {
            itemComponent
        },
		data() {
			return {
                selectedId: '',
                isShow: true,
                innerItems: this.items,
                innerMessage: this.message,
                innerSearch: this.searchData,
				fetchError: this.fetchError
			}
		},
        watch: {
            render: function() {
                this.isShow = this.render;
            },
            items: function() {
                this.innerItems = this.items;
            },
            searchData: function() {
                this.innerSearch = this.searchData;
            },
            message: function() {
                this.innerMessage = this.message;
            }
        },
        methods: {
            openItem(id) {
                this.$emit('openItem', id);
            },
            popUp() {
                console.log('Insert PopUp');
            },
            fut(itemType, id) {
                this.$emit('fut', itemType, id);
            },
            rat(itemType, id, newRate, oldRate) {
                this.$emit('rat', itemType, id, newRate, oldRate);
            }
        }
	}
</script>

<style scoped>

    #spinner {
        margin-top: 25%;
        margin-left: 50%;
    }

    #words {
        margin-left: 4%;
        color: #eadcc7;
    }

    ul {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: left;
        width: 100%;
        margin-top: 2%;
    }

    li {
        margin-right: 2.2%;
    }
</style>
