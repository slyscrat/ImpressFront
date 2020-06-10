<template>
    <div class="items-container">
        <b-navbar toggleable="sm" type="dark" variant="dark">
            <img :src="images.logo" style="cursor:pointer" @click="$router.push('/movie/list')"/>

            <b-navbar-nav class="notes" fill fixed="top">
                <b-nav-item exact
                            exact-active-class="active"
                            v-bind:class="{active: rootRoute.includes('movie')}"
                            to="/movie/list"
                            ref = "/movie/list"
                            @click="changeRoute(); changeState(); scrollToTop();"
                >
                    Фильмы
                </b-nav-item>
                <b-nav-item exact
                            exact-active-class="active"
                            v-bind:class="{active: rootRoute.includes('game')}"
                            to="/game/list"
                            ref = "/game/list"
                            @click="changeRoute(); changeState(); scrollToTop();"
                >
                    Игры
                </b-nav-item>
                <b-nav-item exact
                            exact-active-class="active"
                            v-bind:class="{active: rootRoute.includes('book')}"
                            to="/book/list"
                            ref = "/book/list"
                            @click="changeRoute(); changeState(); scrollToTop();"
                >
                    Книги
                </b-nav-item>
            </b-navbar-nav>
            <b-navbar-nav>
                <form class="form-inline" v-on:keydown.enter.prevent="search">
                    <input class="form-control mr-sm-2" type="search" placeholder="Поиск" v-model="searchData">
                    <b-button @click="search" class="text-hide">
                        <img :src="images.search"/>
                    </b-button>
                </form>
            </b-navbar-nav>
            <b-navbar-nav class="fixedSize">
                <div v-if="!this.$store.getters['security/id']">
                    <b-button v-b-modal.loginModal class="my-button" ref="authBtn">
                        Войти
                    </b-button>
                    <b-button v-b-modal.registrationModal class="link" ref="regBtn">
                        Регистрация
                    </b-button>
                </div>
                <b-nav-item-dropdown v-else-if="this.$store.getters['security/id']" right>
                    <template v-slot:button-content>
                        {{user.nickName}}
                        <img :src="images.user" width="15%">
                    </template>
                    <b-dropdown-item disabled>
                        {{user.name}}
                    </b-dropdown-item>
                    <b-dropdown-item disabled>
                        {{user.email}}
                    </b-dropdown-item>
                    <b-dropdown-item @click="sendLogout">Выйти</b-dropdown-item>
                </b-nav-item-dropdown>
            </b-navbar-nav>

        </b-navbar>
        <b-navbar type="dark" variant="dark" class="lowerNavbar">
            <b-navbar-nav class="notes" fill>
                <b-nav-item exact
                            exact-active-class="active"
                            :to= "this.rootRoute"
                            @click="changeState(); scrollToTop();"
                >
                    Все
                </b-nav-item>
                <b-nav-item exact
                            exact-active-class="active"
                            :to= "this.rootRoute + '/futured'"
                            @click="changeState(); scrollToTop();"
                >
                    Отложенные
                </b-nav-item>
                <b-nav-item exact
                            exact-active-class="active"
                            :to= "this.rootRoute + '/rated'"
                            @click="changeState(); scrollToTop();"
                >
                    Оцененные
                </b-nav-item>
                <b-nav-item exact
                            exact-active-class="active"
                            :to= "this.rootRoute + '/recommended'"
                            @click="changeState(); scrollToTop();"
                >
                    Рекомендованные
                </b-nav-item>
            </b-navbar-nav>
        </b-navbar>
        <sortingComponent :key="cleanInputs" :render="this.isList" :type="this.rootRoute" @search="sort"/>
        <span v-if="showMessage && isList">У произведения есть заметка, поэтому оно отмечено Отложенным</span>
        <itemContainer :render="this.isList" :items="this.items" :searchData="this.searchData" :message="this.fetchError"
                       @openItem="itemInfo" @fut="sendFut" @rat="sendRate"/>
        <div v-if="this.isList">
            <img :src="images.left" @click="move(false)"
                 :class="{unactiveImg: this.page < 2, activeImg: this.page > 1}"
                 style="width:1.8%"/>
            <span>
                Страница {{this.page}}
            </span>
            <img :src="images.right" @click="move(true)"
                 :class="{unactiveImg: this.items.length < 20, activeImg: this.items.length === 20}"
                 style="width:1.8%"/>
        </div>
        <div toggleable="sm" type="dark" variant="dark" class="myFooter">
            2020 Дипломная работа Бутышкиса Ильи
        </div>

        <router-view>
        </router-view>
        <loginModal @register="registration" @auth="reload"/>
        <registrationModal @auth="authorization"/>
    </div>
</template>

<script>
    // TODO : remove test method
	import {mapMutations} from "vuex";
    import {LOGOUT, APPROVE} from "@/store/modules/security";
	import axios from "axios";
    import loginModal from '@/components/common/LoginModal';
    import sortingComponent from '@/components/common/SortingComponent';
    import itemContainer from '@/components/movie/ItemContainer';
    import registrationModal from '@/components/common/RegistrationModal';
    import {API_SERVER_PATH, /*ROLE_ADMIN, ROLE_USER*/} from "@/utils/constants";

	export default {
		name: "MainPage",
        components: {
            loginModal,
            registrationModal,
            sortingComponent,
            itemContainer
        },
		data() {
			return {
                showMessage: false,
                sortInput: 1,
                genresInput: [],
                oldPath: '',
                cleanInputs: 0,
                rootRoute: "",
                searchData: "",
				user: {},
                isList: "",
                page: 1,
                itemToShow: null,
                showModal: false,
                images: {
                    logo: require('@/assets/static/0_log.png'),
                    search: require('@/assets/static/0_searc.png'),
                    user: require('@/assets/static/0_user.png'),
                    left: require('@/assets/static/0_left.png'),
                    right: require('@/assets/static/0_right.png'),
                },
				fetchError: '',
                items: []
			}
		},
		methods: {
			...mapMutations('security', {
				logout: LOGOUT,
                approve: APPROVE
			}),
            scrollToTop() {
                window.scrollTo(0,0);
            },
            itemInfo(id) {
                this.isList = false;
                let route = this.rootRoute;
                route = route.substring(1);
                this.$router.push('/' + route.substring(0, route.indexOf('/') + 1) + id);
                this.oldPath = this.$router.history.getCurrentLocation();
                console.log('MOVIE ROUTE ' + this.oldPath);
            },
            authorization() {
                this.$refs.authBtn.click();
            },
            registration() {
                this.$refs.regBtn.click();
            },
            move(forward) {
                if (forward && this.items.length === 20) this.page++;
                else if (!forward && this.page > 1) this.page--;
                else return false;
                this.fetchData();
                this.scrollToTop();
            },
            sort(sortValue, genresValues, newPage) {
                this.fetchError = "";
                this.searchData = "";
                let genres = "";
                if (newPage) {
                    if (this.genresInput !== genresValues || this.sortInput !== sortValue) {
                        this.sortInput = sortValue;
                        this.genresInput = genresValues;
                        if (this.page !== 1) {
                            this.page = 1;
                            return;
                        }
                    }
                }
                this.sortInput = sortValue;
                this.genresInput = genresValues;
                let params = {};
                if (genresValues.length > 0) {
                    genresValues.forEach((genre) => genres += (genre + ","));
                    genres = genres.substring(0, genres.length - 1);
                    params = {
                        p: this.page - 1,
                        s: sortValue,
                        g: genres
                    }
                }
                else
                    params = {
                        p: this.page - 1,
                        s: sortValue
                    }
                console.log("DATA FROM");
                console.log(this.rootRoute);
                axios.get(API_SERVER_PATH + this.rootRoute, {
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.getters['security/token']
                    },
                    params
                }).then((response) => {
                    console.log('DATA RECEIVED');
                    console.log(response.data);
                    this.items = response.data;
                }).catch((error) => {
                    console.log(error);
                });
            },
            sendLogout() {
                axios.post(API_SERVER_PATH + "/auth/logout", null, {
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.getters['security/token']
                    },
                }).then(() => {
                    this.logout();
                    this.user = {};
                }).catch((error) => {
                    console.log(error);
                });
            },
            fetchData() {
                let path = this.$router.history.getCurrentLocation();
                if (path.includes('search')) {
                    this.search();
                }
                else if (path.includes('futured')) {
                    this.future();
                }
                else if (path.includes('recommended')) {
                    this.recommend();
                }
                else if (path.includes('rated')) {
                    this.rated();
                }
                else {
                    this.sort(this.sortInput, this.genresInput, false);
                }
            },
            sendFut(itemType, id, isUpdate) {
                axios.post(API_SERVER_PATH + `/${itemType}/${id}/rate`, 0, {
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.getters['security/token']
                    },
                }).then(() => {
                    if (isUpdate) {
                        this.fetchData();
                    }
                    else {
                        console.log('UPDATE ITEM VIEW ONLY?');
                        // call itemInfo again?
                    }
                }).catch((error) => {
                    console.log(error);
                });
            },
            sendRate(itemType, id, newRate, oldRate) {
                console.log("SEND RATE");
                console.log(newRate);
                axios.post(API_SERVER_PATH + `/${itemType}/${id}/rate`, newRate, {
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.getters['security/token']
                    },
                }).then((response) => {
                    if (oldRate >= 0 && response.data.rate === 0) {
                        this.showMessage = true;
                        setTimeout(() => this.showMessage = false, 4000);
                    }
                    this.fetchData();
                }).catch((error) => {
                    console.log(error);
                });
            },
            future() {
                this.items = [];
                if (!this.checkAuthorizedAndError()) return;
                axios.get(API_SERVER_PATH + `${this.rootRoute}/future`, {
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.getters['security/token']
                    },
                    params: {
                        p: this.page - 1
                    }
                }).then((response) => {
                    this.items = response.data;
                    if (this.items.length === 0) this.fetchError = "Не найдено отложенных произведений";
                }).catch((error) => {
                    console.log(error);
                });
            },
            recommend() {
                this.items = [];
                if (!this.checkAuthorizedAndError()) return;
                axios.get(API_SERVER_PATH + `${this.rootRoute}/recommended`, {
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.getters['security/token']
                    },
                    params: {
                        p: this.page - 1
                    }
                }).then((response) => {
                    this.items = response.data;
                    console.log(this.items);
                    if (!this.items || this.items.length === 0) this.fetchError = "Сначала необходимо оценить произведения";
                }).catch((error) => {
                    this.fetchError = "Ошибка сервера"
                    console.log(error);
                });
            },
            rated() {
                this.items = [];
                if (!this.checkAuthorizedAndError()) return;
                axios.get(API_SERVER_PATH + `${this.rootRoute}/rated`, {
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.getters['security/token']
                    },
                    params: {
                        p: this.page - 1
                    }
                }).then((response) => {
                    this.items = response.data;
                    if (this.items.length === 0) this.fetchError = "Не найдено оцененных произведений";
                }).catch((error) => {
                    console.log(error);
                });
            },
            checkAuthorizedAndError() {
                if (this.$store.getters['security/token'].length === 0) {
                    this.fetchError = "Необходимо авторизоваться";
                    return false;
                }
                return true;
            },
            changeRoute() {
                console.log('CHANGED ROUTE');
                let route = this.$router.history.getCurrentLocation().substring(1);
                route = route.substring(0, route.indexOf('/'));
                this.rootRoute = '/'+ route + '/list';
                console.log(this.rootRoute);
            },
            changeState() {
                this.cleanInputs++;
                this.searchData = "";
                if (this.sortInput !== 1 || this.genresInput.length !== 0) {
                    this.genresInput = {};
                    this.sortInput = 1;
                }
                this.page = 1;
                this.fetchData();
            },
            changeSelected() {
                (this.$refs[this.rootRoute]).childNodes[0].addClass('active');
            },
            sendLogin() {
                axios.get(API_SERVER_PATH + `/user/${this.$store.getters['security/id']}`, {
                        headers: {
                            'Authorization': 'Bearer ' + this.$store.getters['security/token']
                        }
                    }).then((response) => {
                        this.fetchError = '';
                        this.user = Object.assign({}, this.user, response.data);
                    }).catch((error) => {
                        if (error.request) {
                            this.fetchError = "Сервер не отвечает";
                        }
                    })
            },
            reload() {
                if (this.$store.getters['security/oldId'] != this.$store.getters['security/id']) {
                    //this.$forceUpdate();
                    this.$router.push('/movie/list');
                }
            },
            search() {
                if (this.searchData.length == 0) return false;
                this.$router.push(`${this.rootRoute}/search`);
                this.cleanInputs++;
                axios.get(API_SERVER_PATH + this.rootRoute + '/search', {
                    params: {
                        q: this.searchData,
                        p: this.page - 1
                    },
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.getters['security/token']
                    }
                }).then((response) => {
                    this.items = response.data;
                    /*console.log(response.data);*/
                }).catch((error) => {
                    if (error.request) {
                        this.fetchError = "Сервер не отвечает";
                    }
                })
            }
		},
		mounted() {
            console.log('mounted');
            console.log(this.items);
            this.isList = true;
            this.oldPath = this.$router.history.getCurrentLocation();
            this.changeRoute();
            if (this.$store.getters['security/id']) {
                this.sendLogin();
            }
            this.fetchData();
		},
        updated() {
            console.log('MOVIE updated');
            console.log(this.oldPath);
            if (this.$router.history.getCurrentLocation().includes('list')) this.isList = true;
            if (this.$store.getters['security/id'] && this.$store.getters['security/id'] != this.user.id) this.sendLogin();
            if (this.oldPath !== this.$router.history.getCurrentLocation() && /\d/.test(this.oldPath)) {
                console.log('OLDPATH INTO');
                this.oldPath = this.$router.history.getCurrentLocation();
                this.fetchError = "";
                this.fetchData();
            }
            if (this.$store.getters['security/oldId'] !== this.$store.getters['security/id']){
                this.approve();
                this.page = 1;
                this.fetchData();
                this.fetchError = "";
            }
        }
	}
</script>

<style scoped>
    .test {
        background-color: yellow;
    }

    .activeImg {
        opacity: 1;
        cursor: pointer;
    }

    .unactiveImg {
        opacity: 0.5;
    }

    .items-container {
        background-color: whitesmoke; /*#38444c;*/
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
    }

    .navbar-nav > li {
        float: left;
        position: relative;
    }

    /* TODO */
    .myFooter {
        color: #BDD5EC;
        opacity: 0.5;
        background-color: #292b2c;
        text-align: right;
        height: 5%;
    }

    input[type="text"],
    input[type="search"],
    select.form-control {
        background: transparent;
        border: none;
        border-bottom: 1px solid;
        -webkit-box-shadow: none;
        box-shadow: none;
        border-radius: 0;
    }

    input[type="text"]:focus,
    input[type="search"]:focus,
    select.form-control:focus {
        -webkit-box-shadow: none;
        box-shadow: none;
        color: red;
    }

    .navbar-nav .active::after {
        border-bottom: 5px solid #eadcc7;
        bottom: -10px;
        content: " ";
        left: 0;
        position: absolute;
        right: 0;
    }

    .navbar {
        display: flex;
        flex-direction: row;
        align-content: space-between;
        justify-content: space-around;
    }

    .lowerNavbar {
        opacity: 65%;
    }

    .notes {
        display: flex;
        width: 50%;
        flex-direction: row;
        justify-content: space-between;
    }

    .fixedSize {
        width: 20%;
        background-color: green;
    }


    .fixed-size::after {
        display: none;
        content: none;
    }
</style>
