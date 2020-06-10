<template>
    <div id="sortingComponent" v-if="isShow">
        <b-form-group label="Сортировка">
            <b-form-radio-group
                    v-model="sort"
                    :options="sortOptions"
                    buttons
                    stacked
                    name="radio-btn-stacked"
            ></b-form-radio-group>
        </b-form-group>
        <b-form-group label="Жанры" v-if="genreOptions.length > 0">
            <b-form-checkbox-group
                    v-model="genres"
                    :options="genreOptions"
                    stacked
                    buttons>
            </b-form-checkbox-group>
        </b-form-group>
        <b-button @click="searchRequest">Фильтровать</b-button>
    </div>
</template>

<script>
    import axios from "axios";
    import {API_SERVER_PATH} from "@/utils/constants";

    export default {
        name: "SortingComponent",
        props: ['render', 'type'],
        data() {
            return {
                genres: [],
                sort: 1,
                isShow: true,
                genreOptions: [],
                sortOptions: [
                    { text: 'По дате выпуска (убывание)', value: '1' },
                    { text: 'По дате выпуска (возрастание)', value: '2' },
                    { text: 'По названию (А-Я)', value: '3' },
                    { text: 'По названию (Я-А)', value: '4' }
                ]
            }
        },
        watch: {
            render: function() {
                this.isShow = this.render;
            },
            type: function(){
                this.updateData();
            }
        },
        mounted() {
            this.updateData();
        },
        methods: {
            updateData() {
                this.sort = 1;
                this.genres = [];
                if (this.type === '/book/list') {
                    this.sortOptions[0].text = "По дате выпуска (убывание)";
                    this.sortOptions[1].text = "По дате выпуска (возрастание)";
                    this.genreOptions = [
                        { text: 'Автобиография', value: '100' },
                        { text: 'Биография', value: '101' },
                        { text: 'Детектив', value: '102' },
                        { text: 'История', value: '103' },
                        { text: 'Мелодрама', value: '104' },
                        { text: 'Мемуары', value: '105' },
                        { text: 'Новелла', value: '106' },
                        { text: 'Нуар', value: '107' },
                        { text: 'Ода', value: '108' },
                        { text: 'Повесть', value: '109' },
                        { text: 'Поэма', value: '110' },
                        { text: 'Психология', value: '111' },
                        { text: 'Рассказ', value: '112' },
                        { text: 'Роман', value: '113' },
                        { text: 'Стихотворения', value: '114' },
                        { text: 'Трагикомедия', value: '115' },
                        { text: 'Ужасы', value: '116' }];
                    return;
                }
                else if (this.type === '/game/list') {
                    this.genreOptions = [];
                    this.sortOptions[0].text = "По разработчику (А-Я)";
                    this.sortOptions[1].text = "По разработчику (Я-А)";
                }
                else {
                    this.genreOptions = [];
                    this.sortOptions[0].text = "По дате выпуска (убывание)";
                    this.sortOptions[1].text = "По дате выпуска (возрастание)";
                }
                if (this.type.length > 0)
                axios.get(API_SERVER_PATH + this.type + '/genres').then((response) => {
                    for (let g of response.data) {
                        this.genreOptions.push({text:g.name, value:g.id});
                    }
                }).catch((error) => {
                    console.log(error);
                });
            },
            searchRequest() {
                this.$emit('search', this.sort, this.genres, true);
                window.scrollTo(0,0);
            }
        }
    }
</script>

<style scoped>

    #sortingComponent {
        background-color: #42b983;
        width: 20%;
    }
</style>