import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AssessmentService } from './assessment.service';
import { MaturityModel } from "../models/assessment-info.model";
import { MaturityDomainRemarks, QuestionGrouping } from '../models/questions.model';
const headers = {
  headers: new HttpHeaders().set("Content-Type", "application/json"),
  params: new HttpParams()
};

@Injectable({
  providedIn: 'root'
})
export class MaturityService {


  static currentMaturityModelName: string;
  static allMaturityModels: MaturityModel[];

  cmmcData = null;

  /**
   * 
   * @param http 
   * @param configSvc 
   */
  constructor(
    private assessSvc: AssessmentService,
    private http: HttpClient,
    private configSvc: ConfigService
  ) {
    this.http.get(
      this.configSvc.apiUrl + "MaturityModels",
      headers
    ).subscribe((data: MaturityModel[]) => {
      MaturityService.allMaturityModels = data;
    });
  }


  maturityModelIsEDM(): boolean {
    if (MaturityService.currentMaturityModelName == undefined) {
      MaturityService.currentMaturityModelName = this.assessSvc.assessment.MaturityModel.ModelName;
    };
    return MaturityService.currentMaturityModelName == "EDM";
  }

  /**
   * Posts the current selections to the server.
   */
  postSelection(modelName: string) {
    MaturityService.currentMaturityModelName = modelName;
    return this.http.post(
      this.configSvc.apiUrl + "MaturityModel?modelName=" + modelName,
      null,
      headers
    );
  }

  getDomainObservations() {
    return this.http.get(this.configSvc.apiUrl + "MaturityModel/DomainRemarks",
      headers)
  }

  postDomainObservation(group: MaturityDomainRemarks) {
    return this.http.post(
      this.configSvc.apiUrl + "MaturityModel/DomainRemarks",
      group,
      headers
    );
  }

  /**
   * Gets the saved maturity level from the API.
   * If we store this in the assessment service 'assessment' object,
   * there is no need to go to the API for this.
   */
  getLevel() {
    return this.http.get(
      this.configSvc.apiUrl + "MaturityLevel",
      headers
    )
  }

  /**
   * Returns the name of the current target level.
   */
  targetLevelName() {
    const model = this.assessSvc.assessment.MaturityModel;
    if (!!this.assessSvc.assessment && !!model.MaturityTargetLevel) {
      const l = model.Levels.find(x => x.Level == this.assessSvc.assessment.MaturityModel.MaturityTargetLevel);
      if (!!l) {
        return l.Label;
      }
      return '???';
    }
    else {
      return '???';
    }
  }


  public getResultsData(reportId: string) {
    if (!this.cmmcData) {
      this.cmmcData = this.http.get(this.configSvc.apiUrl + 'reports/' + reportId);
    }
    return this.cmmcData
  }

  /**
   * Posts the selected maturity level to the API. 
   * @param level 
   */
  saveLevel(level: number) {
    if (this.assessSvc.assessment) {
      this.assessSvc.assessment.MaturityModel.MaturityTargetLevel = level;
    }
    return this.http.post(
      this.configSvc.apiUrl + "MaturityLevel",
      level,
      headers
    )
  }


  /**
   * 
   */
  getQuestionsList(isAcetInstallation: boolean) {
    return this.http.get(
      this.configSvc.apiUrl + "MaturityQuestions?isAcetInstallation=" + isAcetInstallation,
      headers
    )
  }

  getModel(modelName: string): MaturityModel {
    for (let m of MaturityService.allMaturityModels) {
      if (m.ModelName == modelName)
        return m;
    }
  }

  getMaturityDeficiency(maturityModel) {
    return this.http.get(this.configSvc.apiUrl + 'getMaturityDeficiencyList?maturity=' + maturityModel);
  }

  getCommentsMarked(maturity) {
    return this.http.get(this.configSvc.apiUrl + 'getCommentsMarked?maturity=' + maturity, headers);
  }
}
