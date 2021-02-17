//////////////////////////////// 
// 
//   Copyright 2021 Battelle Energy Alliance, LLC  
// 
// 
//////////////////////////////// 
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CSETWeb_Api.BusinessLogic.Models
{
    /// <summary>
    /// A cyber-security assessment.
    /// </summary>
    public class AssessmentDetail
    {
        public int Id;
        public string AssessmentName;
        public DateTime CreatedDate;
        public int CreatorId;
        public DateTime? AssessmentDate;
        public string FacilityName;
        public string CityOrSiteName;
        public string StateProvRegion;

        public string Charter;
        public string CreditUnion;
        public string Assets;
        public bool? IsAcetOnly;
        public bool IsAcet { get; internal set; }

        public string DiagramMarkup;
        public string DiagramImage;

        // Selected features of the assessment
        public bool UseStandard;
        public bool UseMaturity;
        public bool UseDiagram;

        // Selected maturity model and the target level
        public MaturityModel MaturityModel;


        /// <summary>
        /// The last time the Assessment was altered.
        /// </summary>
        public DateTime LastModifiedDate;

        public string AdditionalNotesAndComments { get; set; }
        public string AssessmentDescription { get; set; }
        public string ExecutiveSummary { get; set; }
        
    }
}

