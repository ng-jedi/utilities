﻿'use strict';

define(['ciandt-components-utilities-directives', 'ciandt-components-utilities-filters', 'ciandt-components-dialogs'], function () {

    angular.module('ciandt.components.utilities', ['ciandt.components.dialogs',
                                                'ciandt.components.utilities.directives',
                                                'ciandt.components.utilities.filters']);

    angular.module('ciandt.components.utilities').constant('ciandt.components.utilities.UtilitiesConfig', {
        validationMessages: {
            'required': 'Preenchimento obrigatório.',
            'minlength': 'Informe pelo menos {{minLength}} caracteres.',
            'maxlength': 'Informe até {{maxLength}} caracteres.',
            'pattern': 'Valor preenchido é inválido.',
            'equal': 'Valor informado não é igual ao campo anterior.',
            'email': 'Email informado é inválido.',
            'url': 'Url informada é inválida.',
            'number': 'Informe um número válido.',
            'datepicker': 'Informe uma data válida.',
            'date': 'Informe uma data válida.',
            'min': 'Informe um número a partir de {{min}}.',
            'max': 'Informe um número até {{max}}.',
            'cpf': 'CPF informado é inválido.',
            'cnpj': 'CNPJ informado é inválido.',
            'default': 'Conteúdo do campo é inválido.'
        }
    }).provider('ciandt.components.utilities.Utilities', ['$provide', 'ciandt.components.utilities.UtilitiesConfig', '$interpolate', function ($provide, UtilitiesConfig, $interpolate) {
        var $log = angular.injector(['ng']).get('$log');

        var $this = this;

        this.wrapElement = function (element, content, prepend) {
            var wrapper = angular.element(content);
            element.after(wrapper);
            if (prepend) {
                wrapper.prepend(element);
            } else {
                wrapper.append(element);
            }
            return wrapper;
        };

        this.validateCpf = function (strCPF) {
            var add, i, rev;
            strCPF = strCPF.replace(/[^\d]+/g, '');
            if (strCPF == '') return false;
            // Elimina CPFs invalidos conhecidos    
            if (strCPF.length != 11 ||
                strCPF == "00000000000" ||
                strCPF == "11111111111" ||
                strCPF == "22222222222" ||
                strCPF == "33333333333" ||
                strCPF == "44444444444" ||
                strCPF == "55555555555" ||
                strCPF == "66666666666" ||
                strCPF == "77777777777" ||
                strCPF == "88888888888" ||
                strCPF == "99999999999")
                return false;
            // Valida 1o digito 
            add = 0;
            for (i = 0; i < 9; i++)
                add += parseInt(strCPF.charAt(i)) * (10 - i);
            rev = 11 - (add % 11);
            if (rev == 10 || rev == 11)
                rev = 0;
            if (rev != parseInt(strCPF.charAt(9)))
                return false;
            // Valida 2o digito 
            add = 0;
            for (i = 0; i < 10; i++)
                add += parseInt(strCPF.charAt(i)) * (11 - i);
            rev = 11 - (add % 11);
            if (rev == 10 || rev == 11)
                rev = 0;
            if (rev != parseInt(strCPF.charAt(10)))
                return false;
            return true;
        };

        this.validateCnpj = function (strCNPJ) {
            var tamanho, numeros, i, digitos, soma, pos, resultado;
            strCNPJ = strCNPJ.replace(/[^\d]+/g, '');
            if (strCNPJ == '') return false;

            if (strCNPJ.length != 14)
                return false;

            // Elimina CNPJs invalidos conhecidos
            if (strCNPJ == "00000000000000" ||
                strCNPJ == "11111111111111" ||
                strCNPJ == "22222222222222" ||
                strCNPJ == "33333333333333" ||
                strCNPJ == "44444444444444" ||
                strCNPJ == "55555555555555" ||
                strCNPJ == "66666666666666" ||
                strCNPJ == "77777777777777" ||
                strCNPJ == "88888888888888" ||
                strCNPJ == "99999999999999")
                return false;

            // Valida DVs
            tamanho = strCNPJ.length - 2
            numeros = strCNPJ.substring(0, tamanho);
            digitos = strCNPJ.substring(tamanho);
            soma = 0;
            pos = tamanho - 7;
            for (i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2)
                    pos = 9;
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(0))
                return false;

            tamanho = tamanho + 1;
            numeros = strCNPJ.substring(0, tamanho);
            soma = 0;
            pos = tamanho - 7;
            for (i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2)
                    pos = 9;
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(1))
                return false;

            return true;
        };

        this.ngMaskDefaultAlias = {
            'int': function (value) {
                if (typeof value == 'object') {
                    value.repeat = '999';
                }
                return '9';
            },
            'cpf': {
                mask: '999.999.999-99',
                validate: $this.validateCpf
            },
            'cnpj': {
                mask: '99.999.999/9999-99',
                validate: $this.validateCnpj
            },
            'cep': '99.999-999',
            'tel': function (value) {
                if (typeof value == 'string' && (value.length == 8 || value.length == 9)) {
                    return '9?9999-9999'; //Sem DDD
                }
                return '(99) 9?9999-9999';
            },
            'date': '39/19/2999',
        };

        this.enableCors = function ($httpProvider) {
            $log.info('Configurando headers padrões para habilizar CORS.');

            var headers = {
                'Accept': 'application/json,text/plain,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Credendtials': 'true',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            };

            $httpProvider.defaults.useXDomain = true;
            $httpProvider.defaults.headers.common = headers;
        };

        this.fixIISHttpHeaders = function ($httpProvider) {
            angular.forEach(['get', 'post', 'put', 'patch', 'delete'], function (method) {
                if (!$httpProvider.defaults.headers[method]) {
                    $httpProvider.defaults.headers[method] = {};
                }
                // quando If-Modified-Since é igual a "0" ocorre erro no IIS
                // valor 'Thu, 01 Jan 1970 00:00:00 GMT' corresponde a "0"
                $httpProvider.defaults.headers[method]['If-Modified-Since'] = 'Thu, 01 Jan 1970 00:00:00 GMT';
                delete $httpProvider.defaults.headers[method]['X-Requested-With'];
            });
        };

        this.configureRestangular = function (RestangularProvider) {
            $log.info('Configurando Restangular.');

            RestangularProvider.setRestangularFields({
                id: '_id.$oid'
            });

            RestangularProvider.setRequestInterceptor(function (elem, operation, what) {
                if (operation === 'put') {
                    elem._id = undefined;
                    return elem;
                }
                return elem;
            });

            // adiciona um interceptor para o response de consultas paginadas
            RestangularProvider.addResponseInterceptor(function (data, operation, what, url, response, deferred) {
                var extractedData = data;
                if ((operation === "getList" || operation === "post") && data.pageItems && data.totalCount >= 0) {
                    extractedData = data.pageItems;
                    extractedData.totalCount = data.totalCount;
                }
                else if (data instanceof ArrayBuffer) {
                    extractedData.data = data;
                    extractedData.headers = response.headers();
                }
                return extractedData;
            });
        };

        this.applyExceptionHandler = function (handler) {
            $log.info('Registrando mecanismo de exception handler javascript.');

            $provide.decorator("$exceptionHandler", ['$delegate', '$injector', function ($delegate, $injector) {
                return function (exception, cause) {
                    $delegate(exception, cause);

                    var message;

                    if (typeof handler == 'function') {
                        message = handler(exception, cause);
                    }

                    if (!message) {
                        if (exception && exception.message && exception.message.indexOf('$injector') > -1) {
                            message = 'Ocorreu algum erro desconhecido durante carregamento da página.';
                        } else
                        if (exception && exception.message && exception.message.indexOf('$compile:tpload')) {
                            // erro já tratado no handler http, trata-se de pagina template não encontrado.
                            return;
                        } else {
                            message = 'Ocorreu algum erro desconhecido de script.';
                        }
                    }

                    try {
                        var alertHelper = $injector.get('ciandt.components.dialogs.AlertHelper');
                        alertHelper.addError(message);
                    } catch (e) {
                        alert(message);
                    }
                };
            }]);
        };

        this.applyModelStateMessages = function (response, defaultMessage) {
            if (response.modelState) {
                message = [];
                angular.forEach(response.modelState, function (value, key) {
                    var element = jQuery('#' + key.replace('\.', '\\.') + ',[name="' + key.replace('\.', '\\.') + '"]');
                    if (element.length > 0) {
                        element.data('app-modelstate-errors', value);
                        element.addClass('ng-dirty');
                    } else {
                        message.push({ 'message': value, 'type': 'text-danger' });
                    }
                });
                if (message.length == 0) {
                    message = undefined;
                }
            } else {
                message = defaultMessage;
            }
            return message;
        };

        this.applyValidationTooltip = function (scope, element, attrs, ngModel) {
            element.on('change click input paste keyup', function () {
                element.removeData('app-modelstate-errors');
            });

            scope.$watch(function () {
                return (ngModel.$dirty && ngModel.$invalid) || angular.isDefined(element.data('app-modelstate-errors'));
            }, function (value) {
                var tooltip = element.data('bs.tooltip');
                if (value) {
                    scope.$watch(function () {
                        return element.data('bs.tooltip');
                    }, function (value) {
                        if (!value && !_.isEmpty(ngModel.$error)) {
                            element.tooltip({ trigger: 'manual', container: 'body' });
                            element.on('focus.tooltipError mouseenter.tooltipError', function () {
                                var _tooltip = element.data('bs.tooltip');
                                var listError = Object.getOwnPropertyNames(ngModel.$error);
                                var error;

                                // required possui preferência sobre os outros erros, já que quando o campo estiver vazio, deve aparecer a mensagem adequada.
                                if (_.contains(listError, "required")) {
                                    error = "required";
                                } else {
                                    var isFirefox = typeof InstallTrigger !== 'undefined';
                                    //No firefox, a mensagem correta fica no final do array.
                                    if (isFirefox) {
                                        error = listError[listError.length - 1];
                                    } else {
                                        error = listError[0];
                                    }
                                }

                                var message = UtilitiesConfig.validationMessages[error];
                                if (!message) {
                                    if (error == 'appAsyncValidate') {
                                        message = attrs.appAsyncValidateMessage;
                                    }
                                    if (!message) {
                                        message = element.data('app-modelstate-errors');
                                        if (!message) {
                                            message = attrs[error + 'Message'];
                                            if (message && message.indexOf('{{') >= 0) {
                                                message = $interpolate(message)(scope);
                                            } else {
                                                message = UtilitiesConfig.validationMessages.default;
                                            }
                                        }
                                    }
                                }

                                // interpolate message
                                message = $interpolate(message)(angular.extend({}, scope, attrs));

                                if (!_tooltip.tip().hasClass('in') || _tooltip.options.title != message) {
                                    _tooltip.options.title = message;
                                    if ((window.innerWidth || document.documentElement.clientWidth) < 995) {
                                        _tooltip.options.placement = 'top';
                                    } else {
                                        _tooltip.options.placement = 'right';
                                    }
                                    element.next().remove();
                                    element.tooltip('show');
                                }
                            });

                            // oculta tooltip ao perder foco
                            element.on('blur.tooltipError mouseleave.tooltipError', function () {
                                var _tooltip = element.data('bs.tooltip');
                                if (_tooltip && _tooltip.tip().hasClass('in')) {
                                    element.tooltip('hide');
                                }
                            });
                        }
                    });
                } else
                if (tooltip) {
                    element.unbind('focus.tooltipError mouseenter.tooltipError blur.tooltipError mouseleave.tooltipError');
                    element.tooltip('destroy');
                }
            });
        };

        this.$get = [function () {
            return {
                wrapElement: $this.wrapElement,

                validateCpf: $this.validateCpf,

                validateCnpj: $this.validateCnpj,

                ngMaskDefaultAlias: $this.ngMaskDefaultAlias,

                enableCors: $this.enableCors,

                fixIISHttpHeaders: $this.fixIISHttpHeaders,

                configureRestangular: $this.configureRestangular,

                applyExceptionHandler: $this.applyExceptionHandler,

                applyModelStateMessages: $this.applyModelStateMessages,

                applyValidationTooltip: $this.applyValidationTooltip
            };
        }];

    }]);

});