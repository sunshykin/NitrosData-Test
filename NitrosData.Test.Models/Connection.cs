using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NitrosData.Test.Models
{
    /// <summary>
    /// Класс для отображения связей many-to-many
    /// </summary>
    public class Connection
    {
        /// <summary>
        /// Id первой персоны
        /// </summary>
        public int Id1 { get; set; }

        /// <summary>
        /// Id второй персоны, которая состоит в родстве с первой
        /// </summary>
        public int Id2 { get; set; }
    }
}
