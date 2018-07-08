using System.Web.Http.OData;
using Microsoft.AspNetCore.Mvc;
using NitrosData.Test.Data;
using NitrosData.Test.Models;

namespace NitrosData.Test.Web.Controllers.api
{
    [Produces("application/json")]
    [Route("api/Person")]
    public class PersonController : Controller
    {
        private IDataAdapter _adapter;

        public PersonController(IDataAdapter adapter)
        {
            // Using DI
            _adapter = adapter;
        }

        [HttpGet]
        public IActionResult GetList()
        {
            return Ok(_adapter.GetList());
        }

        [HttpGet("{id}")]
        public IActionResult Get([FromRoute]int id)
        {
            var person = _adapter.Get(id);

            if (person != null)
                return Ok(person);
            else
                return NotFound();
        }

        [HttpPost]
        public IActionResult Add([FromBody]Person person)
        {
            _adapter.Save(person);
			return Ok();
        }
		
        [HttpPatch("{id}")]
        public IActionResult Patch([FromBody]Delta<Person> patchPerson, [FromRoute] int id)
        {
	        var original = _adapter.Get(id);

	        if (original == null)
		        return NotFound();

	        patchPerson.Patch(original);

			return Ok();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete([FromRoute]int id)
        {
	        if (_adapter.Delete(id))
		        return Ok();
	        else
		        return NotFound();
        }

        [HttpGet("{id}/Relatives")]
        public IActionResult GetRelatives([FromRoute]int id)
		{
			return Ok(_adapter.GetRelatives(id));
		}

	    [HttpPost("{id}/Relatives/{relative}")]
	    public IActionResult AddRelative([FromRoute] int id, int relative)
	    {
		    _adapter.AddRelative(id, relative);
		    return Ok();
	    }

	    [HttpDelete("{id}/Relatives/{relative}")]
	    public IActionResult DeleteRelative([FromRoute] int id, int relative)
	    {
		    if (_adapter.DeleteRelative(id, relative))
			    return Ok();
		    else
			    return NotFound();
	    }
	}
}