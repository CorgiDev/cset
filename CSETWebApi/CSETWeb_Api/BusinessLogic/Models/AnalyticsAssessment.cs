﻿//////////////////////////////// 
// 
//   Copyright 2021 Battelle Energy Alliance, LLC  
// 
// 
//////////////////////////////// 
using System;

namespace CSETWeb_Api.BusinessLogic.Models
{
    public class AnalyticsAssessment
    {
        public DateTime AssessmentCreatedDate { get; set; }
        public string AssessmentCreatorId { get; set; }
        public DateTime? LastAccessedDate { get; set; }        
        public string Alias { get; set; }
        public string Assessment_GUID { get; set; }
        public DateTime Assessment_Date { get; set; }
        public int SectorId { get; set; }
        public int IndustryId { get; set; }
        public string Assets { get; set; }
        public string Size { get; set; }
        public string Mode { get; set; }
    }
}