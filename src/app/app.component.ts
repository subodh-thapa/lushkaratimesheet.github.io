import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule,MatTableModule,MatButtonModule],
  templateUrl: './pay-table.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent{// implements OnInit{
  title = 'timesheet-calcuator';
  timesheets: TimeSheet[]=[];
  shiftDates: Set<string> = new Set<string>();
  employeesList: Set<string> = new Set<string>();
  //shiftList: Shift[]=[];
  displayedColumns: string[] = ['date', 'clockIn', 'clockOut','totalHours'];
  //totalHours: number = 0;
  employeeTimeSheet : Employee[]=[]
  shifts: Shift[] = [];
  totalHours: string='';
 

  // ngOnInit() {
  //   this.getHours();
  // }

  public getHours() {
    const shiftList: Shift[]=[];// reset for every click
    for(const employee of this.employeesList){
      const employeeTimeSheet = this.timesheets.filter(timesheet=> timesheet.employee === employee);
      this.shiftDates.forEach(date=>{
        const sameDayShits = employeeTimeSheet.filter(timesheet=> timesheet.dateTime.toDateString() === date);
        if (sameDayShits.length>1){
          const shift= sameDayShits[0].action === Action.CLOCKIN 
          ? new Shift(sameDayShits[0].dateTime,sameDayShits[1].dateTime,date)
          : new Shift(sameDayShits[1].dateTime,sameDayShits[0].dateTime,date);
          shiftList.push(shift);
        }
        });
      this.employeeTimeSheet.push(new Employee(employee,shiftList))
    }
    this.shifts = [...this.employeeTimeSheet[0].shifts];
    this.totalHours = this.shifts.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.totalShiftHours;
    }, 0).toFixed(2);
      console.log('this.employeeTimeSheet');
      // console.log(this.employeeTimeSheet);
      // console.log(this.timesheets);
      console.log(this.employeeTimeSheet[0].shifts);
      //console.log(this.totalHours);
  }  

  csvInputChange($event: any) {
    let files = $event.srcElement.files;

    if (this.isValidCSVFile(files[0])) {

      let input = $event.target;
      let reader = new FileReader();
      reader.readAsText(input.files[0]);

      reader.onload = () => {
        let csvData = <string>reader.result;
        let csvToRowArray = csvData.split("\n");
        for (let index = 2; index < csvToRowArray.length; index++) {
          let row = csvToRowArray[index].split(",");
          //console.log(row)
          const timesheet =new TimeSheet(row[0],row[1], row[2].trim());
          this.timesheets.push(timesheet);
          this.shiftDates.add(timesheet.dateTime.toDateString());
          this.employeesList.add(timesheet.employee);
        }
      };
     // console.log(this.timesheets)

      reader.onerror = function () {
        console.log('error is occured while reading file!');
      };

    } else {
      alert("Please import valid .csv file.");
      //this.fileReset();
    }
  }

  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }
}

export class TimeSheet{
  action: Action;
  dateTime: Date;
  employee: string;

  constructor(action: string,dateTime: string, employee: string){
    this.action = action as Action;
    this.dateTime = new Date(dateTime);
    this.employee = employee;
  }
}

export enum Action{
  CLOCKIN = 'Clock In',
  CLOCKOUT = 'Clock out'
}

export class Shift{
 clockIn : Date;
 clockOut: Date;
 totalShiftHours: number;
 date: string;

 constructor(clockIn: Date,clockOut: Date,date: string){
  this.clockIn = clockIn;
  this.clockOut = clockOut;
  this.date = date;
  this.totalShiftHours =  parseFloat((Math.abs(clockOut.getTime() - clockIn.getTime()) / 36e5).toFixed(2));
  }
}

export class Employee{
 name: string;
 shifts: Shift[]=[];
 totalTimeSheetHours:number =0;

 constructor(name:string,shifts:Shift[]){
  this.name = name;
  this.shifts = shifts;
  this.totalTimeSheetHours = this.shifts.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.totalShiftHours;
  }, 0);
  this.totalTimeSheetHours = +this.totalTimeSheetHours.toFixed(2);
  }   

}
