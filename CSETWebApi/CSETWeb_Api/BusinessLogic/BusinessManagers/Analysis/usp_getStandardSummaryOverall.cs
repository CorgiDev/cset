//////////////////////////////// 
// 
//   Copyright 2021 Battelle Energy Alliance, LLC  
// 
// 
//////////////////////////////// 
namespace CSETWeb_Api.Controllers
{
    public class usp_getStandardSummaryOverall
    {   
        public string Answer_Full_Name { get; set; }
        public string Answer_Text { get; set; }
        public int qc { get; set; }
        public int Total { get; set; }
        public int Percent { get; set; }
    }
}

