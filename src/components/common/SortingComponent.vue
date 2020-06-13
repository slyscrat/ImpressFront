<template>
    <div class="fix">
        <div id="sortingComponent" >
            <p>Сортировка</p>
            <div>
                <li :key="i.id" v-for="i in sortOptions">
                    <b-radio button v-model="sort" :value="i.value">{{i.text}}</b-radio>
                </li>
            </div>
            <p>Жанры</p>
            <table id="genres2">
                    <td>
                        <li :key="i.id" v-for="i in genresLeft">
                            <b-checkbox button v-model="genres" :value="i.value">{{i.text}}</b-checkbox>
                        </li>
                    </td>
                    <td>
                        <li :key="i.id" v-for="i in genresRight">
                            <b-checkbox button v-model="genres" :value="i.value">{{i.text}}</b-checkbox>
                        </li>
                    </td>
            </table>
        </div>
        <b-button @click="searchRequest" :active-class="test" >Фильтровать</b-button>
    </div>
</template>

<script>
    import axios from "axios";
    import {API_SERVER_PATH} from "@/utils/constants";

    export default {
        name: "SortingComponent",
        props: ['type'],
        data() {
            return {
                genres: [],
                genresLeft: [],
                genresRight: [],
                sort: 1,
                isShow: true,
                sortOptions: [
                    { text: 'По дате выпуска (убывание)', value: '1' },
                    { text: 'По дате выпуска (возрастание)', value: '2' },
                    { text: 'По названию (А-Я)', value: '3' },
                    { text: 'По названию (Я-А)', value: '4' }
                ]
            }
        },
        watch: {
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
                this.genresLeft = [];
                this.genresRight = [];
                if (this.type === '/book/list') {
                    this.sortOptions[0].text = "По дате выпуска (убывание)";
                    this.sortOptions[1].text = "По дате выпуска (возрастание)";
                    this.genresLeft = [
                        { text: 'Автобиография', value: '100' },
                        { text: 'Детектив', value: '102' },
                        { text: 'Мелодрама', value: '104' },
                        { text: 'Новелла', value: '106' },
                        { text: 'Ода', value: '108' },
                        { text: 'Поэма', value: '110' },
                        { text: 'Рассказ', value: '112' },
                        { text: 'Стихотворения', value: '114' },
                        { text: 'Ужасы', value: '116' }];
                    this.genresRight = [
                        { text: 'Биография', value: '101' },
                        { text: 'История', value: '103' },
                        { text: 'Мемуары', value: '105' },
                        { text: 'Нуар', value: '107' },
                        { text: 'Повесть', value: '109' },
                        { text: 'Психология', value: '111' },
                        { text: 'Роман', value: '113' },
                        { text: 'Трагикомедия', value: '115' },
                    ];
                    return;
                }
                else if (this.type === '/game/list') {
                    this.sortOptions[0].text = "По разработчику (А-Я)";
                    this.sortOptions[1].text = "По разработчику (Я-А)";
                }
                else {
                    this.sortOptions[0].text = "По дате выпуска (убывание)";
                    this.sortOptions[1].text = "По дате выпуска (возрастание)";
                }
                if (this.type.length > 0)
                axios.get(API_SERVER_PATH + this.type + '/genres').then((response) => {
                    let count = 0;
                    for (let g of response.data) {
                        if (count % 2 === 0)
                            this.genresLeft.push({text:g.name, value:g.id});
                        else
                            this.genresRight.push({text:g.name, value:g.id});
                        count++;
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
    p {
        color: #eadcc7;
        font-size: 20px;
        font-weight: 500;
        text-align: left;
        margin: 5px 5%;
    }

    #sortingComponent {
        background-color: #1e2a32;
        width: 310px;
        border-radius: 10px;
        padding: 0.5%;
        margin-top: 35%;
        margin-left: 3%;
    }

    .fix {
        position: fixed;
    }

    .test {
        background-color: purple;
    }

    button {
        height: 6%;
        width: 20.4%;
        background-color: #6d7e8c;
        color: #eadcc7;
        margin: 0.65% 0.6%;
        position: fixed;
    }

    button:focus {
        background-color: #546f87;
        color: #eadcc7;
    }

    button:hover {
        background-color: #889bac;
        color: #eadcc7;
    }
</style>