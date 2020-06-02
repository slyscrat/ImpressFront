<template>
    <b-modal class="reg-container" id="registrationModal"
    hide-footer hide-header size="lg">
        <b-form>
            <b-row class="reg-form-elem">
                <b-col class="text-center">
                    <h4>
                        Регистрация
                    </h4>
                </b-col>
            </b-row>
            <b-row class="reg-form-elem">
                <b-col offset="1" sm="10">
                    <b-input-group class="mb-2 mr-sm-2 mb-sm-0" prepend="E-mail">
                        <b-input id="email-input"
                                 type="text"
                                 v-model="email"
                                 @click="clearError"
                        />
                    </b-input-group>
                </b-col>
            </b-row>
            <b-row class="reg-form-elem">
                <b-col offset="1" sm="10">
                    <b-input-group class="mb-2 mr-sm-2 mb-sm-0" prepend="Имя">
                        <b-input id="name-input"
                                 type="text"
                                 v-model="name"
                                 @click="clearError"
                        />
                    </b-input-group>
                </b-col>
            </b-row>
            <b-row class="reg-form-elem">
                <b-col offset="1" sm="10">
                    <b-input-group class="mb-2 mr-sm-2 mb-sm-0" prepend="Логин">
                        <b-input id="nickName-input"
                                 type="text"
                                 v-model="nickName"
                                 @click="clearError"
                        />
                    </b-input-group>
                </b-col>
            </b-row>
            <b-row class="reg-form-elem">
                <b-col offset="1" sm="10">
                    <b-input-group class="mb-2 mr-sm-2 mb-sm-0" prepend="Пароль">
                        <b-input ref="password"
                                 :type="passwordShow"
                                 v-model="password"
                                 @click="clearError"
                        />
                    </b-input-group>
                    <img ref="passEye" type="password" :src="images.closed" @click="switchVisibility" width="7%">
                </b-col>
            </b-row>
            <b-row class="reg-form-elem">
                <b-col offset="1" sm="10">
                    <b-input-group class="mb-2 mr-sm-2 mb-sm-0" prepend="Проверка пароля">
                        <b-input ref="confirm"
                                 :type="confirmShow"
                                 v-model="password"
                                 @click="clearError"
                        />
                    </b-input-group>
                    <img ref="confirmEye" type="confirm" :src="images.closed" @click="switchVisibility" width="7%">
                </b-col>
            </b-row>
            <b-row class="reg-form-elem">
                <b-col class="text-center">
                    <a
                            style="color: blue;"
                            onmouseover="this.style.color='red'"
                            onmouseout="this.style.color='blue'"
                            onmousedown="this.style.color='firebrick'"
                            @click="authorization"
                            type="submit"
                    >
                        Уже зарегистрированы?
                    </a>
                    <b-button @click="performLogin"
                              size="lg"
                              type="submit"
                              v-if="!authenticationInProgress"
                              variant="primary"
                    >
                        Зарегистрироваться
                    </b-button>
                    <b-spinner label="Spinning" type="grow" v-else variant="primary"/>
                </b-col>
            </b-row>
            <b-row class="reg-form-elem" v-if="authenticationError.length > 0">
                <b-col class="text-center" offset="1" sm="10">
                    <b-alert :show="authenticationError.length > 0" variant="danger">{{authenticationError}}</b-alert>
                </b-col>
            </b-row>
            <b-row class="reg-form-elem" v-if="isSuccess">
                <b-col class="text-center" offset="1" sm="10">
                    <b-alert variant="success">Пользователь успешно создан!</b-alert>
                </b-col>
            </b-row>
        </b-form>
    </b-modal>
</template>

<script>
    import {API_SERVER_PATH} from "@/utils/constants";
    import axios from "axios";
    import {LOGOUT} from "@/store/modules/security";
    import {mapMutations} from "vuex";

    export default {
        name: "RegistrationModal",
        data() {
            return {
                isSuccess: false,
                email: "",
                password: "",
                passwordShow: "password",
                confirmShow: "password",
                confirmPassword: "",
                name: "",
                nickName: "",
                authenticationError: "",
                authenticationInProgress: false,
                images: {
                    open: require('@/assets/static/0_open.png'),
                    closed: require('@/assets/static/0_close.png')
                }
            }
        },
        methods: {
            ...mapMutations('security', {
                logout: LOGOUT
            }),
            switchVisibility(event) {
                let hide = event.target.src == this.images.open;
                event.target.src = hide ? this.images.closed : this.images.open;
                event.target.getAttribute('type') === 'password' ?
                    this.passwordShow = hide ? "password" : "text" :
                    this.confirmShow = hide ? "password" : "text";
            },
            closeModal() {
                this.$nextTick(() => {
                    this.$bvModal.hide('registrationModal');
                })
            },
            authorization() {
                this.$emit('auth', true);
                this.closeModal();
            },
            clearError(){
                this.authenticationError = "";
            },
            performLogin() {
                this.authenticationInProgress = true;
                axios.post(API_SERVER_PATH + "/auth/registration", {
                    email: this.email,
                    password: this.password,
                    name: this.name,
                    nickName: this.nickName
                }).then((response) => {
                    this.authenticationInProgress = false;

                    if (response.data === 'done')
                        this.$nextTick(() => {
                            this.$bvModal.hide('loginModal')
                        })
                    else if (response.data === 'done'){
                        this.authenticationError = "Почтовый адрес уже используется";
                    }
                    else {
                        this.authenticationError = "Возникла ошибка сервера. Попробуйте еще раз";
                    }
                    /*if (response.data['userId'] === 1)
                        this.$router.push('/admin/movie/list');
                    else
                        this.$router.push('/movie/list');*/

/*                    */

                }).catch((error) => {
                    this.authenticationInProgress = false;
                    if (error.response) {
                        this.authenticationError = "Неверный логин или пароль. Попробуйте еще раз";
                    } else if (error.request) {
                        this.authenticationError = "Сервер не отвечает";
                    }
                    this.logout();
                });
            }
        }
    }
</script>

<style scoped>
    img {
        width: 7%;
        cursor:pointer;
    }

    .reg-container {
        border-radius: 30px;
        padding: 2% 0;
        margin: 5% 35%;
        background-color: whitesmoke;
        width: 80%;
    }

    .input-group>.input-group-prepend {
        flex: 0 0 30%;
    }

    .input-group .input-group-text {
        width: 100%;
        justify-content: center;
    }

    .reg-form-elem {
        padding: 10px 0 5px 0;
        margin: 10px;
    }

</style>