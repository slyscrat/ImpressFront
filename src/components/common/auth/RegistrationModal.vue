<template>
    <b-modal class="reg-container" id="registrationModal"
    hide-footer hide-header size="lg" @hide="clearFields">
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
                    <b-input-group class="eyeInput" prepend="Пароль">
                        <b-input ref="password"
                                 :type="passwordShow"
                                 v-model="password"
                                 @click="clearError"
                                 @change="checkPassValid"
                                 @mouseleave="checkPassValid"
                                 style="border-top-right-radius: 0.25rem; border-bottom-right-radius: 0.25rem"
                        />
                        <img ref="passEye" type="password" :src="images.closed" @click="switchVisibility">
                    </b-input-group>
                </b-col>
            </b-row>
            <b-row class="reg-form-elem">
                <b-col offset="1" sm="10">
                    <b-input-group class="eyeInput" prepend="Проверка пароля">
                        <b-input ref="confirm"
                                 :type="confirmShow"
                                 v-model="confirmPassword"
                                 @click="clearError"
                                 autocomplete="off"
                                 @change="checkConfirmed"
                                 @mouseleave="checkConfirmed"
                                 autofill="off"
                                 style="border-top-right-radius: 0.25rem; border-bottom-right-radius: 0.25rem;"
                        />
                        <img ref="confirmEye" type="confirm" :src="images.closed" @click="switchVisibility">
                    </b-input-group>
                </b-col>
            </b-row>
            <b-row class="reg-form-elem">
                <b-col class="text-center">
                    <div v-if="!isSuccess">
                        <a
                                style="color: #6d7f8f; cursor: pointer;"
                                onmouseover="this.style.color='#BDD5EC'"
                                onmouseout="this.style.color='#6d7f8f'"
                                @click="authorization"
                                type="submit"

                        >
                            Уже зарегистрированы?
                        </a>
                        <b-button @click="performLogin"
                                  size="lg"
                                  v-if="!registrationInProgress"
                                  style="margin-left: 30px"
                        >
                            Зарегистрироваться
                        </b-button>
                        <b-spinner label="Spinning" type="grow" v-else variant="primary"/>
                    </div>
                    <div v-else style="color: forestgreen">Пользователь успешно создан!</div>
                </b-col>
            </b-row>
            <b-row class="reg-form-elem" v-if="registrationError.length > 0">
                <b-col class="text-center" offset="1" sm="10">
                    <b-alert :show="registrationError.length > 0" variant="danger">{{registrationError}}</b-alert>
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
                passwordChecked: false,
                passwordConfirmed: false,
                confirmPassword: "",
                name: "",
                nickName: "",
                registrationError: "",
                registrationInProgress: false,
                images: {
                    open: require('@/assets/static/0_eye_open.png'),
                    closed: require('@/assets/static/0_eye_close.png')
                },
                regExp: /^(?=.*[A-Z])(?=.*\d)(?=.*[a-z])[A-Za-z\d]{8,}$/
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
            clearFields() {
                this.clearError();
                this.email = "";
                this.password = "";
                this.confirmPassword = "";
                this.name = "";
                this.nickName = "";
            },
            checkPassValid() {
                if (!this.regExp.exec(this.password)) this.registrationError = "Пароль должен быть не меньше 8 символов и содержать минимум 1 заглавную букву и цифру";
                else {
                    this.registrationError = "";
                    this.passwordChecked = true;
                }
            },
            checkConfirmed() {
                if (this.password !== this.confirmPassword) this.registrationError = "Подтверждение не совпадает с паролем";
                else {
                    this.registrationError = "";
                    this.passwordConfirmed = true;
                }
            },
            checkAllFields() {
                if (this.email.length == 0 || this.password.length == 0 || this.confirmPassword.length == 0 ||
                this.name.length == 0 || this.nickName.length == 0) {
                    this.registrationError = "Необходимо заполнить все поля.";
                }
            },
            closeModal() {
                this.clearFields();
                this.$nextTick(() => {
                    this.$bvModal.hide('registrationModal');
                })
            },
            authorization() {
                this.$emit('auth');
                this.closeModal();
            },
            clearError(){
                this.registrationError = "";
            },
            performLogin(event) {
                event.preventDefault();
                this.checkAllFields();
                if (!this.passwordChecked) this.registrationError += "\nПароль не удовлетворяет условиям безопасности.";
                if (!this.passwordConfirmed) this.registrationError += "\nПароль не подтвержден.";
                if (this.registrationError.length > 0) return false;
                this.registrationInProgress = true;
                axios.post(API_SERVER_PATH + "/auth/registration", {
                    email: this.email,
                    password: this.password,
                    name: this.name,
                    nickName: this.nickName
                }).then((response) => {
                    this.registrationInProgress = false;
                    this.isSuccess = true;
                    if (response.data === 'done') {
                        setTimeout(() => {
                            this.isSuccess = false;
                            this.authorization();
                        },2500)
                    }
                    else
                        this.registrationError = "Почтовый адрес уже используется";
                }).catch(() => {
                    this.registrationError = "Сервер не отвечает";
                });
            }
        }
    }
</script>

<style scoped>
    img {
        width: 28px;
        height: 13%;/*22px;*/
        cursor:pointer;
        margin-left: 25px;
        margin-top: 1.5%;
    }

    .reg-container {
        border-radius: 30px;
        padding: 2% 0;
        margin: 5% 35%;
        background-color: whitesmoke;
        width: 80%;
    }

    /*.input-group>.input-group-prepend {
        flex: 0 0 31%;
    }*/

    .input-group .input-group-text {
        width: 100%;
        justify-content: center;
    }

    .reg-form-elem {
        padding: 10px 0 5px 0;
        margin: 10px;
    }

    .eyeInput {
        width: 109%;
    }

    .input-group-prepend {
        width: 180px;
    }

    button {
        color: #eadcc7;
        background-color: #6d7e8c;
        height: 45px;
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