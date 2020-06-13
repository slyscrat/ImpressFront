<template>
    <div>
        <div class="items-container">
            <div class="headFix">
            <b-navbar toggleable="sm" type="dark" variant="dark" style="background-color: #1e2a32">
                <img :src="images.logo" style="cursor:pointer" @click="changeRouteImg(); changeState(); scrollToTop();"/>

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
                            <img :src="images.search" onmouseover=""/>
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
                    <b-nav-item-dropdown v-else right class="userInfo">
                        <template v-slot:button-content>
                            {{user.nickName}}
                            <img :src="images.user" width="22%">
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
            </div>
            <main v-show="isList">
                <sortingComponent :key="cleanInputs" :type="this.rootRoute" @search="sort"/>
                <span :class="[showMessage && isList ? 'test' : '', 'popUp']"
                      @mouseover="showMessage=false">У произведения есть заметка, поэтому оно отмечено Отложенным</span>
                <div class="itemContainer">
                    <itemContainer :render="this.isList" :items="this.items" :searchData="this.searchData" :message="this.fetchError"
                                   @openItem="itemInfo" @fut="sendFut" @rat="sendRate"/>
                    <div v-if="isList && (items.length === 20 || page > 1)" class="pages">
                        <img :src="images.left" @click="move(false)"
                             :class="{unactiveImg: this.page < 2, activeImg: this.page > 1}"
                             style="width:3%"/>
                        <span style="margin: 0 10px">
                            Страница {{this.page}}
                        </span>
                        <img :src="images.right" @click="move(true)"
                             :class="{unactiveImg: this.items.length < 20, activeImg: this.items.length === 20}"
                             style="width:3%"/>
                    </div>
                </div>
            </main>

            <div
                :class="{myFooter: items.length > 4 && isList, myFooterFixed: items.length < 5}"
                v-if="isList">
                2020 Дипломная работа Бутышкиса Ильи
            </div>
            <router-view>
            </router-view>
            <loginModal @register="registration" @auth="reload"/>
            <registrationModal @auth="authorization"/>
        </div>
        <div v-if="showMessage">

        </div>
    </div>
</template>

<script>
    import {mapMutations} from "vuex";
    import {APPROVE, LOGOUT} from "@/store/modules/security";
    import axios from "axios";
    import loginModal from '@/components/common/auth/LoginModal';
    import sortingComponent from '@/components/common/SortingComponent';
    import itemContainer from '@/components/common/item/ItemContainer';
    import registrationModal from '@/components/common/auth/RegistrationModal';
    import {API_SERVER_PATH,} from "@/utils/constants";

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
            test(event) {
                console.log(event.type);
                console.log(event.target);
                let element = event.target;
                if (event.type === 'mouseover')
                    event.target.className += " test";
                else
                    element.className = event.target.className.replace(' test','');
            },
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
                    this.reload();
                    this.fetchData();
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
            sendFut(itemType, id) {
                axios.post(API_SERVER_PATH + `/${itemType}/${id}/rate`, 0, {
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.getters['security/token']
                    },
                }).then(() => {
                    this.fetchData();
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
            changeRouteImg(){
                this.$router.push('/movie/list');
                this.changeRoute();
            },
            changeRoute() {
                console.log('CHANGED ROUTE');
                this.fetchError = '';
                this.searchData = '';
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
                /*if (this.$store.getters['security/oldId'] != this.$store.getters['security/id']) {*/
                    //this.$forceUpdate();
                    this.$router.push('/movie/list');
                    this.changeRoute();
                /*}*/
            },
            search() {
                if (this.searchData.length == 0) return false;
                this.$router.push(`${this.rootRoute}/search`);
                window.scrollTo(0,0);
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
            this.oldPath = this.$router.history.getCurrentLocation();
            this.isList = this.oldPath.includes('list');
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
            if (this.oldPath !== this.$router.history.getCurrentLocation()) {
                console.log('OLDPATH INTO');
                if (/\d/.test(this.oldPath)) {
                    this.fetchData();
                }
                this.oldPath = this.$router.history.getCurrentLocation();
                this.fetchError = "";
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

    .popUp {
        cursor: default;
        position: fixed;
        bottom: 0px;
        left: 29.42%;
        background-color: #6d7e8c;
        color: #eadcc7;
        height: 25px;
        position: center;
        width: 40%;
        text-align: center;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        z-index: 1000;
        opacity: 0;
        transition: .55s opacity;
    }

    .test {
        opacity: 1;
    }

    .activeImg {
        opacity: 1;
        cursor: pointer;
    }

    .unactiveImg {
        opacity: 0.5;
    }

    .items-container {
        background-color: #38444c;
        position: absolute;
        top: 0;
        left: 0;
        min-height: 100%;
        width: 100%;
        z-index: -2;
    }

    .navbar-nav > li {
        float: left;
        position: relative;
    }

    .myFooter {
        bottom: 0;
    }

    .myFooterFixed {
        position: fixed;
        bottom: 0;
    }

    .myFooter,
    .myFooterFixed {
        color: #BDD5EC;
        background-color: #1e2a32;
        text-align: right;
        padding-right: 5%;
        width: 100%;
        height: 25px;
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
        color: #bdd5ec;
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

    .itemContainer ::v-deep {
        margin-left: 23%;
        margin-top: 8.3%;
        padding: 0;
    }

    .lowerNavbar {
        background-color: #27333b;
    }

    .pages {
        display: flex;
        justify-content: center;
        align-items: center;
        color: #eadcc7;
    }

    .notes {
        display: flex;
        width: 50%;
        flex-direction: row;
        justify-content: space-between;
    }

    .fixedSize {
        width: 14.25%;
    }

    .userInfo {
        padding-left: 60%;
    }

    main {
        padding: 1.5% 7%;
    }

    .headFix {
        position: fixed;
        width: 100%;
        z-index: 100;
    }

    .fixed-size::after {
        display: none;
        content: none;
    }
</style>
