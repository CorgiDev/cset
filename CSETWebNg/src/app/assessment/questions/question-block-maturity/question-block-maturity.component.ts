////////////////////////////////
//
//   Copyright 2020 Battelle Energy Alliance, LLC
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in all
//  copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//  SOFTWARE.
//
////////////////////////////////
import { Component, Input, OnInit } from '@angular/core';
import { Question, QuestionGrouping, Answer } from '../../../models/questions.model';
import { AssessmentService } from '../../../services/assessment.service';
import { ConfigService } from '../../../services/config.service';
import { QuestionsService } from '../../../services/questions.service';


/**
 * This was cloned from question-block to start a new version that is
 * not so "subcategory-centric", mainly for the new simplified
 * maturity question display.  Hopefully this more generic version
 * of the question block can eventually replace the original.
 */
@Component({
  selector: 'app-question-block-maturity',
  templateUrl: './question-block-maturity.component.html'
})
export class QuestionBlockMaturityComponent implements OnInit {

  @Input() myGrouping: QuestionGrouping;

  expanded = false;
  percentAnswered = 0;
  answerOptions = [];

  /**
   * Constructor.
   * @param configSvc 
   */
  constructor(
    public configSvc: ConfigService,
    public questionsSvc: QuestionsService,
    public assessSvc: AssessmentService
  ) { }

  /**
   * 
   */
  ngOnInit(): void {
    this.answerOptions = this.assessSvc.assessment.MaturityModel.AnswerOptions;

    this.refreshReviewIndicator();
    this.refreshPercentAnswered();

    if (this.configSvc.acetInstallation) {
      // this.altTextPlaceholder = this.altTextPlaceholder_ACET;
    }
  }

    /**
   * If there are no spaces in the question text assume it's a hex string
   * @param q
   */
  applyWordBreak(q: Question) {
    if (q.QuestionText.indexOf(' ') >= 0) {
      return "normal";
    }
    return "break-all";
  }

  /**
   * 
   * @param ans 
   */
  showThisOption(ans: string) {
    return true;
  }

  formatGlossaryLink(q: Question) {
    if (q.QuestionText.indexOf('[[') < 0) {
       return q.QuestionText;
    }

    // we have one or more glossary terms
    return '<span [matTooltip]="blah blah blah">services</span> ' + q.QuestionText;

  }

  /**
   * Pushes an answer asynchronously to the API.
   * @param q
   * @param ans
   */
  storeAnswer(q: Question, newAnswerValue: string) {
    // if they clicked on the same answer that was previously set, "un-set" it
    if (q.Answer === newAnswerValue) {
      newAnswerValue = "U";
    }

    q.Answer = newAnswerValue;

    const answer: Answer = {
      AnswerId: q.Answer_Id,
      QuestionId: q.QuestionId,
      QuestionType: q.QuestionType,
      QuestionNumber: q.DisplayNumber,
      AnswerText: q.Answer,
      AltAnswerText: q.AltAnswerText,
      Comment: q.Comment,
      Feedback: q.Feedback,
      MarkForReview: q.MarkForReview,
      Reviewed: q.Reviewed,
      Is_Component: q.Is_Component,
      Is_Requirement: q.Is_Requirement,
      Is_Maturity: q.Is_Maturity,
      ComponentGuid: q.ComponentGuid
    };

    this.refreshReviewIndicator();

    this.refreshPercentAnswered();

    this.questionsSvc.storeAnswer(answer)
      .subscribe();
  }

  /**
   *
   */
  saveMFR(q: Question) {
    q.MarkForReview = !q.MarkForReview; // Toggle Bind

    const newAnswer: Answer = {
      AnswerId: q.Answer_Id,
      QuestionId: q.QuestionId,
      QuestionType: q.QuestionType,
      QuestionNumber: q.DisplayNumber,
      AnswerText: q.Answer,
      AltAnswerText: q.AltAnswerText,
      Comment: '',
      Feedback: '',
      MarkForReview: q.MarkForReview,
      Reviewed: q.Reviewed,
      Is_Component: q.Is_Component,
      Is_Requirement: q.Is_Requirement,
      Is_Maturity: q.Is_Maturity,
      ComponentGuid: q.ComponentGuid
    };

    this.refreshReviewIndicator();
    this.questionsSvc.storeAnswer(newAnswer).subscribe();
  }

  /**
   * Looks at all questions in the subcategory to see if any
   * are marked for review.
   * Also returns true if alt text is required but not supplied.
   */
  refreshReviewIndicator() {
    this.myGrouping.HasReviewItems = false;
    this.myGrouping.Questions.forEach(q => {
      if (q.MarkForReview) {
        this.myGrouping.HasReviewItems = true;
        return;
      }
      if (q.Answer == 'A' && this.isAltTextRequired(q)) {
        this.myGrouping.HasReviewItems = true;
        return;
      }
    });
  }

  /**
   * Calculates the percentage of answered questions for this subcategory.
   * The percentage for maturity questions is calculated using questions
   * that are within the assessment's target level.  
   */
  refreshPercentAnswered() {
    let answeredCount = 0;
    let totalCount = 0;

    this.myGrouping.Questions.forEach(q => {
      if (q.Is_Maturity) {
        if (q.MaturityLevel <= this.assessSvc.assessment?.MaturityModel.MaturityTargetLevel) {
          totalCount++;
          if (q.Answer && q.Answer !== "U") {
            answeredCount++;
          }
        }
      } else {
        totalCount++;
        if (q.Answer && q.Answer !== "U") {
          answeredCount++;
        }
      }
    });
    this.percentAnswered = (answeredCount / totalCount) * 100;
  }

    /**
   * For ACET installations, alt answers require 3 or more characters of 
   * justification.
   */
  isAltTextRequired(q: Question) {
    if (this.configSvc.acetInstallation
      && (!q.AltAnswerText || q.AltAnswerText.trim().length < 3)) {
      return true;
    }
    return false;
  }
}