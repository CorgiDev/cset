﻿//////////////////////////////// 
// 
//   Copyright 2021 Battelle Energy Alliance, LLC  
// 
// 
//////////////////////////////// 
using System;
using CSETWeb_Api.BusinessLogic.ImportAssessment;
using Newtonsoft.Json.Linq;

namespace CSETWeb_Api.BusinessLogic.BusinessManagers
{
    internal class CSET_10_0_0_to_10_0_1_Upgrade : ICSETJSONFileUpgrade
    {
        /// <summary>
        /// this is the string we will be upgrading to
        /// </summary>
        static string versionString = "10.0.1";

        /// <summary>
        /// 
        /// </summary>
        /// <param name="json"></param>
        /// <returns></returns>
        public string ExecuteUpgrade(string json)
        {
            return json;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        public System.Version GetVersion()
        {
            return System.Version.Parse(versionString);
        }
    }
}
