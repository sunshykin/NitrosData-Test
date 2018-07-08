using System;
using System.Collections;
using System.Collections.Generic;
using NitrosData.Test.Models;

namespace NitrosData.Test.Data
{
    public interface IDataAdapter
    {
        IEnumerable<Person> GetList();

        Person Get(int id);

        void Save(Person person);

        bool Delete(int id);

        IEnumerable<int> GetRelatives(int id);

	    void AddRelative(int id, int relative);

	    bool DeleteRelative(int id, int relative);
    }
}
