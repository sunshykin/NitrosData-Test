using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NitrosData.Test.Models
{
    public class Person
    {
        public int Id { get; set; }

        /// <summary>
        /// Фамилия
        /// </summary>
        public string Surname { get; set; }

        /// <summary>
        /// Имя
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Отчество
        /// </summary>
        public string MiddleName { get; set; }

        /// <summary>
        /// Дата рождения
        /// </summary>
        public DateTime BirthDate { get; set; }

        /// <summary>
        /// Адрес
        /// </summary>
        public string Address { get; set; }
    }
}
