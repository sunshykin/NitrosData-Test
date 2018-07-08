using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NitrosData.Test.Models;

namespace NitrosData.Test.Data
{
    public class DataAdapter : IDataAdapter
    {
        private IDictionary<int, Person> _persons;

        private List<Connection> _connections;

        public DataAdapter()
        {
            _persons = Seed();
            _connections = new List<Connection>();
        }

        public IEnumerable<Person> GetList()
        {
            return _persons.Values;
        }

        public Person Get(int id)
        {
            Person p;
            if (_persons.TryGetValue(id, out p))
                return p;
            else
                return null;
        }

        public void Save(Person person)
        {
	        if (person.Id < 1)
		        person.Id = _persons.Max(p => p.Value.Id) + 1;

			if (_persons.ContainsKey(person.Id))
                _persons.Remove(person.Id);

            _persons.Add(person.Id, person);
        }

        public bool Delete(int id)
        {
            if (_persons.ContainsKey(id))
            {
                DeleteConnections(id);
                return _persons.Remove(id);
            }
            else
                return false;
        }

        private void DeleteConnections(int id)
        {
            _connections
                .Where(c => c.Id1 == id || c.Id2 == id).ToList().ForEach(con => _connections.Remove(con));
        }

        public IEnumerable<int> GetRelatives(int id)
        {
            return _connections
                .Where(c => c.Id1 == id).Select(c => c.Id2)
                .Union(_connections.Where(c => c.Id2 == id).Select(c => c.Id1));
		}

	    public void AddRelative(int id, int relative)
		{
			var con = _connections
				.FirstOrDefault(c => c.Id1 == id && c.Id2 == relative || c.Id1 == relative && c.Id2 == id);

			if (con == null)
				_connections.Add(new Connection { Id1 = id, Id2 = relative });
		}

	    public bool DeleteRelative(int id, int relative)
	    {
		    var con = _connections
			    .FirstOrDefault(c => c.Id1 == id && c.Id2 == relative || c.Id1 == relative && c.Id2 == id);

		    if (con != null)
		    {
				_connections.Remove(con);
			    return true;
		    }
			else
			    return false;
		}

		private static IDictionary<int, Person> Seed()
        {
            return new Dictionary<int, Person>
            {
                {1, new Person() {Id = 1, Name = "Павел", MiddleName = "Иосифович", Surname = "Лужков",
                    BirthDate = new DateTime(1995, 5, 11), Address = "Москва, ул. Пушкина, д. Колотушкина" }},
                {2, new Person() {Id = 2, Name = "Петр", MiddleName = "Иннокентьевич", Surname = "Ванко",
                    BirthDate = new DateTime(1985, 3, 5), Address = "Санкт-Петербург, ул. Мира, д. 333" }},
                {3, new Person() {Id = 3, Name = "Михаил", MiddleName = "Борисович", Surname = "Власов",
                    BirthDate = new DateTime(1991, 11, 24), Address = "Москва, ул. Волочаевская, д. 8" }},
                {4, new Person() {Id = 4, Name = "Дмитрий", MiddleName = "Леонидович", Surname = "Федосов",
                    BirthDate = new DateTime(1997, 4, 16), Address = "Санкт-Петербург, Новоизмайловский пр., д. 16к2" }},
                {5, new Person() {Id = 5, Name = "Артур", MiddleName = "Васильевич", Surname = "Никольский",
                    BirthDate = new DateTime(1986, 11, 30), Address = "Москва, ул. Пушкина, д. Колотушкина" }},
                {6, new Person() {Id = 6, Name = "Алексей", MiddleName = "Анатольевич", Surname = "Навальный",
                    BirthDate = new DateTime(1976, 6, 4), Address = "Москва, ул. Ленинская слобода, д. 19, комн. 21а" }}
            };
        }
    }
}
