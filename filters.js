/**
     * Типа базовый класс для внешних говнофильтров, хотя по идее его тоже можно бы инстанцировать
     * с правильными настройками, и он вроде как будет работать, но я зачем-то это запретил
     *
     * TODO не показывать кнопку и список и не рендерить, если нет данных, хотя штуку с кнопкой
     *      лучше оставить отдельным реализациям, как сейчас, но с некоторыми оговорками
     * TODO фильтр поиска по тексторому полю с фильтрацией по visible
     * TODO сброс visible и прочих полей при выставлении свежих данных, но это нужно продумать
     * TODO метод externalFilter для применения к данным других совместимых внешних
     *      фильтров-наследников BaseFilter
     * TODO методы beforeFilter и afterFilter для пред- и пост-обработки данных
     * TODO запилить совместимую фильтрацию в новую BTable
     */
    var BaseFilter = function(container, options) {
        var __self, __container, __options, __instantiationPreventionByNamespace;

        __instantiationPreventionByNamespace = 'filter.abstract';
        __options = {};
        __self = this;

        BaseFilter.prototype.defaultOptions = {
            onFilter: false,
            namespace: __instantiationPreventionByNamespace,
            values: {},
            css: {},
            classes: {
                topContainer: 'filter-top-container'
            },
            events: {
               filterOn: 'change'
            },
            vendor: {  // Внешние зависимости
                render: _.template
            },
            title: 'Выберите элементы',
            templates: {
                container: '<div class="<%= options.classes.topContainer %>"></div>',
                content: false
            }
        };

        BaseFilter.prototype.__construct__ = function(container, options) {
            __self.setOptions(options);
            __self.setContainer(container);
            options = __self.getOptions();
            if (options.namespace == __instantiationPreventionByNamespace) {  // Это вообще пушка, даже стыдно за такое
                throw new Error('Ошибка: Невозможно инстанцировать абстрактный класс BaseFilter');
            }
            __self.bind();
            __self.update();
            return __self;
        };

        BaseFilter.prototype.setContainer = function(container) {
            var options = __self.getOptions();
            container = container || options.vendor.render(options.templates.container, {options: options});
            __container = $(container);
            return __self;
        };

        BaseFilter.prototype.getContainer = function() {
            return __container;
        };

        BaseFilter.prototype.update = function(values) {
            var options = __self.getOptions();
            if (values) {
                __self.render(values);
            } else {
                __self.render(options.values);
            }
            return __self;
        };

        BaseFilter.prototype.render = function(data) {
            var options, container;
            try {
                container = __self.getContainer();
                if (!$.isEmptyObject(data)) {
                    options = __self.getOptions();
                    container.html(options.vendor.render(options.templates.content, {items: data, options: options}));  // Ололо
                } else {
                    container.empty();
                }
                container.css(options.css);
            } catch (e) {
                console.log(e);
            }
            return __self;
        };

        BaseFilter.prototype.setOptions = function(options) {
            __options = $.extend(true, {}, __self.getDefaultOptions(), __options, options);
            return __self;
        };

        BaseFilter.prototype.getOptions = function() {
            return __options;
        };

        BaseFilter.prototype.getDefaultOptions = function() {
            return BaseFilter.prototype.defaultOptions;
        };

        BaseFilter.prototype.bind = function() {
            var options = __self.getOptions();
            var container = __self.getContainer();
            var filter = __self.getEventNameWithNamespace(options.events.filterOn);
            container.on(filter, __self.onFilter);
            return __self;
        };

        BaseFilter.prototype.unbind = function() {
            var options = __self.getOptions();
            var container = __self.getContainer();
            var filter = __self.getEventNameWithNamespace(options.events.filterOn);
            container.off(filter);
            return __self;
        };

        BaseFilter.prototype.getEventNameWithNamespace = function(text) {
            var options = __self.getOptions();
            return text + '.' + options.namespace;
        };

        BaseFilter.prototype.onFilter = function(e, data) {
            var options = __self.getOptions();
            var value = __self.getFilter();
            if (typeof options.onFilter === 'function') {
                options.onFilter({filter: value});
            }
        };

        BaseFilter.prototype.getFilter = function() {
            var container = __self.getContainer();
            return container.val();
        };

        BaseFilter.prototype.moveNodes = function(where) {
            where = $(where);
            var container = __self.getContainer();
            container.appendTo(where);
        };

        BaseFilter.prototype.byClass = function(className) {
            return '.' + className;
        };

        return __self.__construct__(container, options);
    };


    /**
     * Говнофильтр на чекбоксах
     */
    var CheckboxFilter = extend(function(container, options) {
        var __self, __parent;
        __self = this;
        __parent = CheckboxFilter.superclass;

        CheckboxFilter.prototype.defaultOptions = $.extend(true, {}, __parent.defaultOptions, {  // Неохота было писать подходящие стили, поэтому эмулировал разметку chosen и продублировал/переименовал/переразбил классы
            namespace: 'filter.checkboxBased',
            classes: {
                container: {
                    default: 'chfilter-container',
                    extra: '',
                    active: 'chfilter-container-active'
                },
                trigger: {
                    default: 'chfilter-default',
                    extra: '',
                    active: 'chfilter-with-drop'
                },
                drop: {
                    default: 'chfilter-drop',
                    extra: ''
                },
                results: {
                    default: 'chfilter-results',
                    extra: ''
                },
                item: {
                    default: 'active-result',
                    extra: ''
                },
                checkbox: {
                    default: 'chfilter-item-checkbox',
                    extra: ''
                },
                hidden: 'default-hidden'
            },
            events: {
                showOn: 'click',
                hideOn: 'click'
            },
            templates: {
                content: '<div class="<%= options.classes.container.default %> <%= options.classes.container.extra %>">\
                              <a tabindex="-1" class="<%= options.classes.trigger.default %> <%= options.classes.trigger.extra %>" href="javascript:void(0)">\
                                  <span><%= options.title %></span>\
                                  <div><b></b></div>\
                              </a>\
                              <div class="<%= options.classes.drop.default %> <%= options.classes.extra %> <%= options.classes.hidden %>">\
                                  <ul class="<%= options.classes.results.default %> <%= options.classes.results.extra %>">\
                                  <% _.each(items, function(item) { %>\
                                      <% var checked = (item.checked) ? "checked=checked" : ""; %>\
                                      <li class="<%= options.classes.item.default %> <%= options.classes.item.extra %>">\
                                          <input type="checkbox" class="<%= options.classes.checkbox.default %> <%= options.classes.checkbox.extra %>" \
                                                  id="__filter_checkbox__<%= item.key %>" value="<%= item.key %>" <%= checked %> />\
                                          <label for="__filter_checkbox__<%= item.key %>"><%= item.value %></label>\
                                      </li>\
                                  <% }); %>\
                                  </ul>\
                              </div>\
                          </div>'
            }
        });

        CheckboxFilter.prototype.onTriggerAction = function(e, data) {
            var container = __self.getContainer();
            var options = __self.getOptions();
            container.find(__self.byClass(options.classes.container.default)).toggleClass(options.classes.container.active);
            container.find(__self.byClass(options.classes.trigger.default)).toggleClass(options.classes.trigger.active);
            container.find(__self.byClass(options.classes.drop.default)).toggleClass(options.classes.hidden);
            container.find(__self.byClass(options.classes.results.default)).scrollTop(0);  // Сброс положения
        };

        CheckboxFilter.prototype.onClose = function(e, data) {
            var container = __self.getContainer();
            var options = __self.getOptions();
            var item = $(e.target);
            if (!item.is(container) && item.closest(container).length === 0) {
                container.find(__self.byClass(options.classes.container.default)).removeClass(options.classes.container.active);
                container.find(__self.byClass(options.classes.trigger.default)).removeClass(options.classes.trigger.active);
                container.find(__self.byClass(options.classes.drop.default)).addClass(options.classes.hidden);
            }
        };

        CheckboxFilter.prototype.bind = function() {
            var context = __parent.bind();
            var options = __self.getOptions();
            var show = __self.getEventNameWithNamespace(options.events.showOn);
            var hide = __self.getEventNameWithNamespace(options.events.hideOn);
            __self.getContainer().on(show, __self.byClass(options.classes.trigger.default), __self.onTriggerAction);
            $('html, body').on(hide, __self.onClose);
            return context;
        };

        CheckboxFilter.prototype.getFilter = function() {
            var checked = __self.getContainer().find(':checkbox:checked');
            return checked.map(function(i, item) {
                return $(item).val();
            }).get();
        };

        __parent.constructor.call(__self, container, $.extend(true, {}, __self.defaultOptions, options));
    }, BaseFilter);


    /**
     * Говнофильтр на $.chosen
     */
    var SelectFilter = extend(function(container, options) {
        var __self, __parent;
        __self = this;
        __parent = SelectFilter.superclass;

        SelectFilter.prototype.defaultOptions = $.extend(true, {}, __parent.defaultOptions, {
            namespace: 'filter.selectBased',
            chosen: {
                minimumResultsForSearch: 10,
                placeholder: 'Выберите раздел',
                dropdownCssClass: 'filter-selectBased',
                containerCssClass: 'select2-container',
                allowClear: true
            },
            templates: {
                container: '<select data-placeholder="Выберите раздел" class="<%= options.classes.topContainer %>"><option></option></select>',
                content: '<option></option>\
                          <option value="__all">Все</option>\
                          <% _.each(items, function(item) { %> \
                              <option value="<%= item.key %>"><%= item.value %></option>\
                          <% }); %>'
            }
        });

        SelectFilter.prototype.update = function(values) {
            var context = __parent.update(values);
            var options = __self.getOptions();
            // container.trigger('liszt:updated');
            container.select2(options.chosen);
            container.hide();
            return context;
        };

        SelectFilter.prototype.bind = function() {
            var options = __self.getOptions();
            var context = __parent.bind();
            container = __self.getContainer();
            // container.select2(options.chosen);
            return context;
        };

        SelectFilter.prototype.getFilter = function() {
            var container = __self.getContainer();
            return [container.val()];
        };

        SelectFilter.prototype.moveNodes = function(where) {
            where = $(where);
            var container = __self.getContainer();
            var options = __self.getOptions();
            container.siblings(__self.byClass(options.chosen.containerCssClass)).appendTo(where);
            container.appendTo(where);
        };

        __parent.constructor.call(__self, container, $.extend(true, {}, __self.defaultOptions, options));
    }, BaseFilter);
    
