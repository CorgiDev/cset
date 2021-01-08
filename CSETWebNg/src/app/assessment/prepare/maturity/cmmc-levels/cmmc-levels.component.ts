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
import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../../../services/navigation.service';
import { AssessmentService } from '../../../../services/assessment.service';
import { MaturityService } from '../../../../services/maturity.service';
import { MaturityLevel } from '../../../../models/maturity.model';


@Component({
  selector: 'app-cmmc-levels',
  templateUrl: './cmmc-levels.component.html'
})
export class CmmcLevelsComponent implements OnInit {

  selectedLevel: MaturityLevel = { Label: "zero", Level: 0 };

  constructor(
    private assessSvc: AssessmentService,
    public maturitySvc: MaturityService,
    public navSvc: NavigationService
  ) { }


  /**
   * 
   */
  ngOnInit() {
    if (this.assessSvc.assessment == null) {
      this.assessSvc.getAssessmentDetail().subscribe((data: any) => {
        this.assessSvc.assessment = data;
        console.log(this.assessSvc.assessment);
        this.selectedLevel.Level = this.assessSvc.assessment.MaturityModel.MaturityTargetLevel;
      });
    } else {
      this.selectedLevel.Level = this.assessSvc.assessment.MaturityModel.MaturityTargetLevel;
    }
  }

  /**
   * 
   * @param newLevel 
   */
  saveLevel(newLevel) {
    this.maturitySvc.availableLevels.forEach(l => {
      if (l.Level === newLevel) {
        this.selectedLevel = l;
      }
    });

    this.maturitySvc.saveLevel(this.selectedLevel.Level).subscribe(() => {
      return;
    });
  }

}
