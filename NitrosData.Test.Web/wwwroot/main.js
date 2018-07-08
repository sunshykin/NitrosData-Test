// Компонент Master-страницы
Vue.component('master',
    {
        template: '#master-page',
        props: {
            data: Array,
            columns: Array
        },
        data: function() {
            var sortOrders = {}
            this.columns.forEach(function(col) {
                sortOrders[col.name] = 1
            })
            return {
                searchQuery: '',
                sortKey: '',
                sortOrders: sortOrders
            }
        },
        computed: {
            filteredData: function() {
                var sortKey = this.sortKey
                var filterKey = this.searchQuery && this.searchQuery.toLowerCase();
                var order = this.sortOrders[sortKey] || 1
                var data = this.data
                if (filterKey) {
                    data = data.filter(function(row) {
                        return Object.keys(row).some(function(key) {
                            if (['surname', 'name', 'birthDateStr'].indexOf(key) > -1)
                                return String(row[key]).toLowerCase().indexOf(filterKey) > -1;
                            return false;
                        })
                    })
                }
                if (sortKey) {
                    data = data.slice().sort(function(a, b) {
                        a = a[sortKey]
                        b = b[sortKey]
                        return (a === b ? 0 : a > b ? 1 : -1) * order
                    })
                }
                return data
            }
        },
        filters: {
            capitalize: function(str) {
                return str.charAt(0).toUpperCase() + str.slice(1)
            }
        },
        methods: {
            sortBy: function(key) {
                if (!key.toLowerCase().includes('name'))
                    return;

                this.sortKey = key;
                this.sortOrders[key] = this.sortOrders[key] * -1;
            },

            // Удаление данных выбранной строки
            deleteRow(id) {
                // Записываем id персоны для удаления
                this.$root.master.delPersonId = id;

                // Показываем модальное окно удаления
                this.$root.master.showDelModal = true;
            },

            // Редактирование данных выбранной строки
            editRow(person) {
                // Записываем данные персоны для редактирования
                this.$root.master.editPerson = {
                    id: person.id,
                    surname: person.surname,
                    name: person.name,
                    middleName: person.middleName,
                    birthDate: person.birthDate,
                    address: person.address
                };

                // Показываем модальное окно редактирования
                this.$root.master.showEditModal = true;
            },
            // Создание новой строки
            createRow() {
                // Записываем пустые данные
                this.$root.master.editPerson = {
                    surname: null,
                    name: null,
                    middleName: null,
                    birthDate: null,
                    birthDateStr: null,
                    address: null
                };

                // Показываем модальное окно создания новой записи
                this.$root.master.showCreateModal = true;
            },

            // Открытие деталей для выбранной персоны
            openDetails(person) {
                //
                this.$root.getRelativesREST(person);

                // Запись выбранной персоны в App
                this.$root.details.person = person;

                // Перевод режима
                this.$root.mode = 'details';
            }
        }
    });

// Компонент модального окна с кнопками Yes/No
Vue.component('yes-no-modal',
    {
        template: '#yn-modal',
        computed: {
            classObject: function () {
                return {
                    'modal-del': this.$root.master.showDelModal,
                    'modal-edit': !this.$root.master.showDelModal
                }
            }
        },
        methods: {
            // Функция по нажатию 'Yes'-кнопки
            onYes() {
                this.$emit('yes');
            },
            // Функция по нажатию 'No'-кнопки
            onNo() {
                this.$emit('no');
            }
        }
    }
);

// Компонент Details
Vue.component('detail',
    {
        template: '#details-page',
        data: function () {
            return {
                // Персона, родственники которой рассматриваются
                person: this.$root.details.person,
                // Id персоны выбранной для добавления в родственники
                selectedId: -1,

                // Флаг отображения модального окна добавления родственника
                showAddModal: false
            };
        },
        props: {
            columns: Array
        },
        computed: {
            // Флаг отображения таблицы с родственниками
            isRelatives: function() {
                return this.$root.details.relativeIds.length > 0;
            },

            relativesData: function () {
                var rel = this.$root.master.persons.filter((p) => { return this.$root.details.relativeIds.includes(p.id) });

                // Меняем значение флага для отображения таблицы/заглушки
                /*if (rel.length > 0)
                    this.isRelatives = true;
                else
                    this.isRelatives = false;*/

                return rel;
            },
            nonRelativesData: function () {
                return this.$root.master.persons.filter((p) => {
                    return !this.$root.details.relativeIds.includes(p.id) && p.id != this.person.id;
                });
            }
        },
        methods: {
            // Post-запрос на сервер для добавлени нового родственника
            postRelativeREST: function (id, relative) {
                axios.post('/api/Person/' + id + '/Relatives/' + relative);
            },

            // Delete-запрос на сервер для добавлени нового родственника
            delRelativeREST: function (id, relative) {
                axios.delete('/api/Person/' + id + '/Relatives/' + relative);
            },

            // Возврат к Master-странице
            backToMaster() {
                // Перевод режима
                this.$root.mode = 'master';

                // Очистка персоны в App
                this.$root.details.person = null;

                // Очищаем список родственников
                this.$root.details.relativeIds = [];
            },

            addRelative() {
                this.showAddModal = true;
            },

            // Отмена добавления родственника
            cancelAdd: function () {
                // Скрываем модальное окно добавления
                this.showAddModal = false;

                // Очищаем id персоны для добавления
                this.selectedId = -1;
            },

            // Подтверждение добавления родственника
            confirmAdd: function () {
                if (this.selectedId < 1)
                    return;

                // Отправляем данные на сервер
                this.postRelativeREST(this.person.id, this.selectedId);

                // Добавление строки в таблицу
                this.$root.details.relativeIds.push(this.selectedId);
                
                // Для экономии выполняем cancel, поскольку нам нужен такой же функционал
                this.cancelAdd();
            },

            // ToDo сделать подтверждение на удаление родственника
            deleteRelative(id) {
                // Отправляем данные на сервер
                this.delRelativeREST(this.person.id, id);

                // Очистка строки в таблице
                var index = this.$root.details.relativeIds.findIndex(p => p == id);
                this.$root.details.relativeIds.splice(index, 1);
            }
        }
    }
);


var app = new Vue({
    el: '#app',
    data: {
        mode: 'master',

        // Данные Master-страницы
        master: {
            // Колонки
            columns: [
                { name: 'surname', caption: 'Фамилия' }, { name: 'name', caption: 'Имя' },
                { name: 'middleName', caption: 'Отчество' },
                { name: 'birthDateStr', caption: 'Дата рождения' }, { name: 'address', caption: 'Адрес' }
            ],
            //Данные о персонах
            persons: [],

            // Флаг отображения модального окна удаления
            showDelModal: false,
            // Id персоны для удаления
            delPersonId: -1,

            // Флаг отображения модального окна редактирования
            showEditModal: false,
            // Персона для редактирования
            editPerson: null,

            // Флаг отображения модального окна создания новой персоны
            showCreateModal: false
        },

        // Данные Details-страницы
        details: {
            // Колонки
            columns: [
                { name: 'surname', caption: 'Фамилия' }, { name: 'name', caption: 'Имя' },
                { name: 'middleName', caption: 'Отчество' }
            ],
            // Данные о персонe
            person: null,
            // Родственники
            relativeIds: []
        }
    },
    methods: {
        // Get-запрос на сервер для получения списка родственников
        getRelativesREST: async function (person) {
            var response = await axios.get('/api/Person/' + person.id + '/Relatives');
            this.details.relativeIds = response.data;
        },

        // Get-запрос на сервер для получения списка персон
        getPersonsREST: function () {
            axios.get('/api/Person')
                .then(response => {
                    this.master.persons = response.data.map(function (p) {
                        var date = new Date(p.birthDate);
                        var day = ("0" + date.getDate()).slice(-2);
                        var month = ("0" + (date.getMonth() + 1)).slice(-2);
                        return {
                            id: p.id,
                            surname: p.surname,
                            name: p.name,
                            middleName: p.middleName,
                            birthDate: date.getFullYear() + '-' + month + '-' + day, 
                            birthDateStr: date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'short', day: 'numeric' }),
                            address: p.address
                        };
                    });
                });
        },

        // Delete-запрос на сервер для удаления персоны
        deletePersonREST: function(id) {
            axios.delete('/api/Person/' + id);
        },

        // Post-запрос на сервер для сохранения данных персоны
        postPersonREST: function(person) {
            axios.post('/api/Person',
                {
                    id: person.id,
                    surname: person.surname,
                    name: person.name,
                    middleName: person.middleName,
                    birthDate: new Date(person.birthDate),
                    address: person.address
                });
        },

        // Patch-запрос на сервер для сохранения данных персоны
        patchPersonREST: function(person, id) {
            axios.patch('/api/Person/' + id, person);
        },

        // Отмена удаления персоны
        cancelDelete: function() {
            // Скрываем модальное окно удаления
            this.master.showDelModal = false;

            // Очищаем id персоны для удаления
            this.master.delPersonId = -1;
        },

        // Функция удаления персоны
        deletePerson: function() {
            // Отправление запроса на удаление объекта на сервере
            this.deletePersonREST(this.master.delPersonId);

            // Очистка строки в таблице
            var index = this.master.persons.findIndex(p => p.id == this.master.delPersonId);
            this.master.persons.splice(index, 1);

            // Для экономии выполняем cancel, поскольку нам нужен такой же функционал
            this.cancelDelete();
        },

        // Отмена редактирования данных персоны
        cancelEdit: function () {
            // Скрываем модальное окно редактирования
            this.master.showEditModal = false;

            // Очищаем данные персоны для редактирования
            this.master.editPerson = null;
        },

        getPatchPersonInfo: function (person) {
            // Версия данных персоны, которая есть на сервере
            var original = this.master.persons[this.master.persons.findIndex(p => p.id == person.id)];
            var result = {};

            if (original.surname !== person.surname)
                result.Surname = person.surname;
            if (original.name !== person.name)
                result.Name = person.name;
            if (original.middleName !== person.middleName)
                result.MiddleName = person.middleName;
            if (original.birthDate !== person.birthDate)
                result.BirthDate = new Date(person.birthDate);
            if (original.address !== person.address)
                result.Address = person.address;

            return result;
        },

        // Функция сохранения редактированых данных персоны
        saveEdit: function () {
            // Собираем информацию для патча
            var patch = this.getPatchPersonInfo(this.master.editPerson);
            
            // Отправление запроса на изменение объекта на сервере
            this.patchPersonREST(patch, this.master.editPerson.id);

            // Изменение данных в строке таблицы
            var index = this.master.persons.findIndex(p => p.id == this.master.editPerson.id);
            var or = this.master.persons[index];

            or.surname = this.master.editPerson.surname;
            or.name = this.master.editPerson.name;
            or.middleName = this.master.editPerson.middleName;
            or.address = this.master.editPerson.address;
            or.birthDate = this.master.editPerson.birthDate;
            or.birthDateStr =  new Date(this.master.editPerson.birthDate)
                .toLocaleDateString('ru-RU', { year: 'numeric', month: 'short', day: 'numeric' });

            // Для экономии выполняем cancel, поскольку нам нужен такой же функционал
            this.cancelEdit();
        },

        // Отмена сохранения новой персоны
        cancelCreate: function () {
            // Скрываем модальное окно сохранения
            this.master.showCreateModal = false;

            // Очищаем данные персоны
            this.master.editPerson = null;
        },

        // Функция сохранения новой персоны
        saveCreate: function () {
            // Отправление запроса на удаление объекта на сервере
            this.postPersonREST(this.master.editPerson);

            // Добавление строки в таблицу
            this.master.editPerson.birthDateStr = new Date(this.master.editPerson.birthDate)
                .toLocaleDateString('ru-RU', { year: 'numeric', month: 'short', day: 'numeric' });
            this.master.persons.push(this.master.editPerson);

            // Для экономии выполняем cancel, поскольку нам нужен такой же функционал
            this.cancelCreate();
        }
    },
    mounted: function () {
        this.getPersonsREST();
    }
})