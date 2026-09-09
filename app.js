const SUPABASE_URL="https://qbbbpussyzkutonpvaze.supabase.co";
const SUPABASE_ANON_KEY="sb_publishable_QqqqICyurLbmaMBPUwfF_g_8_jVZYuO";
const REDIRECT_URL="https://ot-tracker-psi.vercel.app/";
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);

let user=null,records=[],month=new Date(),duty=9,signUp=false;
const NORMAL_OT_RATE=8.94;
const $=id=>document.getElementById(id);
function fmt(n){return `${Number(n.toFixed(2))}h`}
function hours(inT,outT){if(!inT||!outT)return 0;let [ih,im]=inT.split(':').map(Number),[oh,om]=outT.split(':').map(Number);let a=ih*60+im,b=oh*60+om;if(b<a)b+=1440;return Math.max(0,(b-a)/60)}
function monthKey(){return `${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,'0')}`}
function todayKey(){let d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}

// UAE public holidays used by the WorkTrack Abu Dhabi calendar for 2026.
// Dates are kept here so public holidays are visible even before an attendance record is added.
const UAE_HOLIDAYS_2026={
  '2026-01-01':'New Year’s Day',
  '2026-03-19':'Eid Al-Fitr',
  '2026-03-20':'Eid Al-Fitr',
  '2026-03-21':'Eid Al-Fitr',
  '2026-03-22':'Eid Al-Fitr',
  '2026-05-25':'Arafat Day / Eid Al-Adha',
  '2026-05-26':'Arafat Day / Eid Al-Adha',
  '2026-05-27':'Arafat Day / Eid Al-Adha',
  '2026-05-28':'Arafat Day / Eid Al-Adha',
  '2026-05-29':'Arafat Day / Eid Al-Adha',
  '2026-06-15':'Hijri New Year',
  '2026-08-28':'Prophet’s Birthday',
  '2026-12-02':'UAE National Day',
  '2026-12-03':'UAE National Day'
};
function publicHolidayName(date){return UAE_HOLIDAYS_2026[date]||''}
function profile(){return user?.user_metadata||{}}
function displayName(){let p=profile(),full=[p.first_name,p.surname].filter(Boolean).join(' ');return full||user?.email?.split('@')[0]||'Employee'}
function setText(id,text){$(id).textContent=text||''}

async function init(){
  const {data:{session},error}=await sb.auth.getSession();
  if(error){showAuth();authMessage(error.message,true);return}
  if(session?.user){user=session.user;showApp();await load()}else showAuth();
  sb.auth.onAuthStateChange(async (_e,s)=>{if(s?.user){user=s.user;showApp();await load()}else{user=null;showAuth()}});
}
function showAuth(){$('authView').classList.remove('hidden');$('appView').classList.add('hidden')}
function showApp(){
  $('authView').classList.add('hidden');$('appView').classList.remove('hidden');
  let p=profile(),name=displayName(),initial=(name.trim()[0]||'W').toUpperCase();
  setText('headerName',name);setText('headerEmployeeId',p.employee_id?`ID • ${p.employee_id}`:'');setText('heroName',name.split(' ')[0]);setText('avatarInitial',initial);
  setTag('profileCompany',p.company_name);setTag('profilePosition',p.position);setTag('profileEmployee',p.employee_id?`Employee ID • ${p.employee_id}`:'');
}
function setTag(id,text){$(id).textContent=text||'';$(id).classList.toggle('hidden',!text)}
function authMessage(text,isError=false){$('authMessage').textContent=text;$('authMessage').className=`message ${text?(isError?'error':'success'):''}`}
function setAuthMode(){
  $('authSubmitText').textContent=signUp?'Create account':'Sign in';
  $('toggleAuth').textContent=signUp?'Already have an account? Sign in':'Create an account';
  $('resendConfirm').classList.toggle('hidden',!signUp);
  $('signupFields').classList.toggle('hidden',!signUp);
  $('authTitle').textContent=signUp?'Create your account':'Welcome back';
  $('authSubtitle').textContent=signUp?'Set up your employee profile to get started.':'Sign in to manage your work records.';
  $('password').autocomplete=signUp?'new-password':'current-password';
  ['firstName','surname','companyName','employeeId','position'].forEach(id=>$(id).required=signUp);
  authMessage('');
}
$('toggleAuth').onclick=()=>{signUp=!signUp;setAuthMode()};
$('togglePassword').onclick=()=>{let is=$('password').type==='password';$('password').type=is?'text':'password';$('togglePassword').textContent=is?'Hide':'Show';$('togglePassword').setAttribute('aria-label',is?'Hide password':'Show password')};
$('authForm').onsubmit=async e=>{
  e.preventDefault();
  const email=$('email').value.trim().toLowerCase(),password=$('password').value;
  if(!email||!password)return;
  $('authSubmit').disabled=true;authMessage('Please wait…');
  try{
    if(signUp){
      const metadata={first_name:$('firstName').value.trim(),surname:$('surname').value.trim(),company_name:$('companyName').value.trim(),employee_id:$('employeeId').value.trim(),position:$('position').value.trim()};
      const r=await sb.auth.signUp({email,password,options:{emailRedirectTo:REDIRECT_URL,data:metadata}});
      if(r.error)authMessage(r.error.message,true);
      else if(r.data.session){authMessage('Account created and signed in successfully.');user=r.data.user;showApp();await load()}
      else authMessage('Account created. Check your email and tap the confirmation link, then return here and sign in.');
    }else{
      const r=await sb.auth.signInWithPassword({email,password});
      if(r.error){const msg=r.error.message||'';if(/email not confirmed/i.test(msg))authMessage('Your email is not confirmed yet. Switch to Create account and tap “Resend confirmation”.',true);else authMessage(msg,true)}
      else if(r.data.session){user=r.data.user;showApp();await load()}else authMessage('Login did not create a session. Please try again.',true);
    }
  }catch(err){authMessage(err?.message||'Something went wrong. Please try again.',true)}
  finally{$('authSubmit').disabled=false}
};
$('resendConfirm').onclick=async()=>{const email=$('email').value.trim().toLowerCase();if(!email){authMessage('Enter your email address first.',true);return}$('resendConfirm').disabled=true;authMessage('Sending confirmation email…');try{const r=await sb.auth.resend({type:'signup',email,options:{emailRedirectTo:REDIRECT_URL}});if(r.error)authMessage(r.error.message,true);else authMessage('Confirmation email requested. Check your inbox and spam folder.')}catch(err){authMessage(err?.message||'Could not resend the email.',true)}finally{$('resendConfirm').disabled=false}};
$('logout').onclick=async()=>{await sb.auth.signOut()};
function profileMessage(text,isError=false){$('profileMessage').textContent=text||'';$('profileMessage').className=`message ${text?(isError?'error':'success'):''}`}
function openProfile(){
  let p=profile();
  $('profileFirstName').value=p.first_name||'';
  $('profileSurname').value=p.surname||'';
  $('profileCompanyName').value=p.company_name||'';
  $('profileEmployeeId').value=p.employee_id||'';
  $('profilePositionInput').value=p.position||'';
  $('profileEmail').value=user?.email||'';
  profileMessage('');
  $('profileDialog').showModal();
}
function closeProfile(){$('profileDialog').close()}
$('profileButton').onclick=openProfile;
$('closeProfile').onclick=closeProfile;
$('cancelProfile').onclick=closeProfile;
$('profileDialog').addEventListener('click',e=>{if(e.target===$('profileDialog'))closeProfile()});
$('profileForm').onsubmit=async e=>{
  e.preventDefault();
  let data={first_name:$('profileFirstName').value.trim(),surname:$('profileSurname').value.trim(),company_name:$('profileCompanyName').value.trim(),employee_id:$('profileEmployeeId').value.trim(),position:$('profilePositionInput').value.trim()};
  $('saveProfile').disabled=true;profileMessage('Saving changes…');
  try{
    let r=await sb.auth.updateUser({data});
    if(r.error){profileMessage(r.error.message,true);return}
    user=r.data.user||user;
    showApp();
    profileMessage('Profile updated successfully.');
    setTimeout(()=>{if($('profileDialog').open)closeProfile()},650);
  }catch(err){profileMessage(err?.message||'Could not update your profile.',true)}
  finally{$('saveProfile').disabled=false}
};


async function load(){
  if(!user)return;
  let p=await sb.from('profiles').select('duty_hours').eq('id',user.id).single();
  if(p.data)duty=Number(p.data.duty_hours)||9;
  $('dutyHours').value=duty;
  let start=`${monthKey()}-01`,end=new Date(month.getFullYear(),month.getMonth()+1,0).toISOString().slice(0,10);
  let r=await sb.from('attendance').select('*').gte('work_date',start).lte('work_date',end).order('work_date',{ascending:false});
  if(r.error){alert(r.error.message);return}records=r.data||[];render();
}
function render(){
  $('monthTitle').textContent=month.toLocaleString('en',{month:'long',year:'numeric'});
  $('monthMeta').textContent=`${records.length} record${records.length===1?'':'s'}`;
  let present=records.filter(x=>x.status==='present');
  let worked=present.reduce((sum,x)=>sum+hours(x.check_in,x.check_out),0);
  let ot=present.reduce((sum,x)=>sum+Math.max(0,hours(x.check_in,x.check_out)-duty),0);
  let dayOffCount=records.filter(x=>x.status==='off').length;
  let leaveCount=records.filter(x=>x.status==='leave').length;
  let holidayWorkedCount=records.filter(x=>x.status==='present'&&publicHolidayName(x.work_date)).length;
  let scheduledDays=present.length+leaveCount;
  let attendanceRate=scheduledDays?Math.round((present.length/scheduledDays)*100):0;
  let avg=present.length?worked/present.length:0;
  $('workingDays').textContent=present.length;
  $('dayOffCount').textContent=dayOffCount;
  $('leaveCount').textContent=leaveCount;
  $('attendanceRate').textContent=`${attendanceRate}%`;
  $('workedHours').textContent=fmt(worked);
  $('otHours').textContent=fmt(ot);
  $('regularHours').textContent=fmt(Math.max(0,worked-ot));
  $('avgHours').textContent=fmt(avg);
  $('holidayWorkedCount').textContent=holidayWorkedCount;
  $('payrollOtHours').textContent=fmt(ot);
  $('estimatedOtPay').textContent=`AED ${(ot*NORMAL_OT_RATE).toFixed(2)}`;
  $('analyticsWorked').textContent=`${fmt(worked)} worked`;
  $('analyticsOt').textContent=`${fmt(ot)} OT`;
  renderCalendar();renderTable();renderAnalytics();
}

function renderAnalytics(){
  let daily=[];
  let days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  for(let n=1;n<=days;n++){
    let date=`${monthKey()}-${String(n).padStart(2,'0')}`,r=records.find(x=>x.work_date===date);
    let h=r&&r.status==='present'?hours(r.check_in,r.check_out):0;
    let ot=r&&r.status==='present'?Math.max(0,h-duty):0;
    if(h||ot)daily.push({n,h,ot});
  }
  renderBars('hoursChart',daily,'h','Worked hours',v=>v.h);
  renderBars('otChart',daily,'ot','Overtime',v=>v.ot);
  let counts={Present:records.filter(x=>x.status==='present').length,Leave:records.filter(x=>x.status==='leave').length,Off:records.filter(x=>x.status==='off').length,Holiday:records.filter(x=>x.status==='holiday').length};
  let max=Math.max(1,...Object.values(counts));
  $('statusChart').innerHTML=Object.entries(counts).map(([name,count])=>`<div class="status-row"><div><span>${name}</span><b>${count}</b></div><div class="status-track"><i style="width:${Math.round(count/max*100)}%"></i></div></div>`).join('');
}
function renderBars(id,data,key,label,valueFn){
  let el=$(id);
  if(!data.length){el.innerHTML='<div class="chart-empty">No worked hours recorded this month.</div>';return}
  let max=Math.max(.01,...data.map(valueFn));
  el.innerHTML=data.map(x=>`<div class="bar-item" title="${label}: ${fmt(valueFn(x))}"><span class="bar-value">${valueFn(x)?fmt(valueFn(x)):'-'}</span><div class="bar-track"><i style="height:${Math.max(4,Math.round(valueFn(x)/max*100))}%"></i></div><small>${x.n}</small></div>`).join('');
}
function renderCalendar(){
  let c=$('calendar');c.innerHTML='';['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(x=>{let d=document.createElement('div');d.className='cal-head';d.textContent=x;c.appendChild(d)});
  let first=new Date(month.getFullYear(),month.getMonth(),1),days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  for(let i=0;i<first.getDay();i++){let d=document.createElement('div');d.className='day mutedday';c.appendChild(d)}
  for(let n=1;n<=days;n++){let date=`${monthKey()}-${String(n).padStart(2,'0')}`,r=records.find(x=>x.work_date===date),holiday=publicHolidayName(date),d=document.createElement('div');d.className='day'+(date===todayKey()?' today':'')+(holiday?' public-holiday':'');d.innerHTML=`<div class="daynum">${n}</div>`;if(r){let h=hours(r.check_in,r.check_out),ot=Math.max(0,h-duty);d.innerHTML+=`<span class="pill ${ot?'ot':r.status==='present'?(holiday?'holidayworked':'normal'):'leave'}">${r.status==='present'?(ot?`+${fmt(ot)} OT`:fmt(h)):r.status}</span>`;if(holiday)d.title=`${holiday}${r.status==='present'?' • Worked':''}`}else if(holiday){d.innerHTML+=`<span class="pill holiday">Holiday</span>`;d.title=holiday}d.onclick=()=>openDialog(r,date);c.appendChild(d)}
}
function renderTable(){
  let t=$('records');t.innerHTML='';$('emptyRecords').classList.toggle('hidden',records.length>0);
  records.forEach(r=>{let h=hours(r.check_in,r.check_out),ot=Math.max(0,h-duty),tr=document.createElement('tr');tr.innerHTML=`<td>${r.work_date}</td><td>${r.check_in||'-'}</td><td>${r.check_out||'-'}</td><td>${fmt(h)}</td><td><b>${fmt(ot)}</b></td><td class="status ${ot?'ot':r.status==='present'?'normal':'leave'}">${r.status}</td><td><button class="ghost edit" type="button">Edit</button></td>`;tr.querySelector('.edit').onclick=()=>openDialog(r);t.appendChild(tr)})
}
function openDialog(r,date){
  $('attendanceDialog').showModal();$('recordId').value=r?.id||'';$('date').value=r?.work_date||date||todayKey();$('checkIn').value=r?.check_in||'';$('checkOut').value=r?.check_out||'';$('status').value=r?.status||'present';$('notes').value=r?.notes||'';$('deleteRecord').classList.toggle('hidden',!r);$('dialogTitle').textContent=r?'Edit attendance':'Add attendance';updateTimeRequirement();
}
function updateTimeRequirement(){let present=$('status').value==='present';$('checkIn').required=present;$('checkOut').required=present;$('timeHint').textContent=present?'For Present, both check-in and check-out are required.':'For Leave, Off day or Holiday, check-in and check-out can be left blank.'}
$('status').onchange=updateTimeRequirement;
$('closeDialog').onclick=()=>{$('attendanceDialog').close()};
$('attendanceDialog').addEventListener('click',e=>{if(e.target===$('attendanceDialog'))$('attendanceDialog').close()});
$('attendanceForm').onsubmit=async e=>{e.preventDefault();let id=$('recordId').value,status=$('status').value;if(!$('date').value)return alert('Please select a date.');if(status==='present'&&(!$('checkIn').value||!$('checkOut').value))return alert('Please enter both check-in and check-out times.');let obj={user_id:user.id,work_date:$('date').value,check_in:status==='present'?$('checkIn').value:null,check_out:status==='present'?$('checkOut').value:null,break_minutes:0,status,notes:$('notes').value.trim()||null};let r=id?await sb.from('attendance').update(obj).eq('id',id).eq('user_id',user.id):await sb.from('attendance').insert(obj);if(r.error)alert(r.error.message);else{$('attendanceDialog').close();await load()}};
$('deleteRecord').onclick=async()=>{let id=$('recordId').value;if(id&&confirm('Delete this attendance record?')){let r=await sb.from('attendance').delete().eq('id',id).eq('user_id',user.id);if(r.error)alert(r.error.message);else{$('attendanceDialog').close();await load()}}};
$('addToday').onclick=()=>openDialog(null,todayKey());$('prevMonth').onclick=()=>{month=new Date(month.getFullYear(),month.getMonth()-1,1);load()};$('nextMonth').onclick=()=>{month=new Date(month.getFullYear(),month.getMonth()+1,1);load()};$('todayMonth').onclick=()=>{let t=new Date();month=new Date(t.getFullYear(),t.getMonth(),1);load()};
$('saveSettings').onclick=async()=>{let v=Number($('dutyHours').value);if(v<=0||v>24)return alert('Enter duty hours between 0.25 and 24.');let r=await sb.from('profiles').upsert({id:user.id,duty_hours:v});if(r.error)alert(r.error.message);else{duty=v;render();alert('Settings saved.')}};
function reportTotals(){
  let present=records.filter(x=>x.status==='present'),worked=present.reduce((sum,x)=>sum+hours(x.check_in,x.check_out),0),ot=present.reduce((sum,x)=>sum+Math.max(0,hours(x.check_in,x.check_out)-duty),0);
  return {present,worked,ot,regular:Math.max(0,worked-ot),off:records.filter(x=>x.status==='off').length,leave:records.filter(x=>x.status==='leave').length,holidayWorked:records.filter(x=>x.status==='present'&&publicHolidayName(x.work_date)).length};
}
function exportPdf(){
  if(!window.jspdf?.jsPDF){alert('PDF generator is still loading. Please try again.');return}
  let {jsPDF}=window.jspdf,doc=new jsPDF({unit:'pt',format:'a4'}),p=profile(),name=displayName(),t=reportTotals();
  let monthName=month.toLocaleString('en',{month:'long',year:'numeric'});
  doc.setFillColor(11,18,32);doc.rect(0,0,595,842,'F');
  doc.setTextColor(235,241,250);doc.setFont('helvetica','bold');doc.setFontSize(24);doc.text('WorkTrack',40,55);
  doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(145,160,185);doc.text('Attendance • Hours • Overtime',40,73);
  doc.setFont('helvetica','bold');doc.setFontSize(18);doc.setTextColor(235,241,250);doc.text(monthName,40,115);
  doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(170,183,204);
  doc.text(`Employee: ${name}`,40,140);doc.text(`Employee ID: ${p.employee_id||'-'}`,40,156);doc.text(`Company: ${p.company_name||'-'}`,40,172);doc.text(`Position: ${p.position||'-'}`,40,188);
  let summary=[['Present',t.present.length],['Leave',t.leave],['Day off',t.off],['Holiday worked',t.holidayWorked],['Worked hours',fmt(t.worked)],['Regular hours',fmt(t.regular)],['Overtime',fmt(t.ot)],['OT rate',`AED ${NORMAL_OT_RATE.toFixed(2)}/h`],['Estimated OT pay',`AED ${(t.ot*NORMAL_OT_RATE).toFixed(2)}`]];
  doc.setFont('helvetica','bold');doc.setFontSize(12);doc.setTextColor(235,241,250);doc.text('Monthly summary',40,220);
  let y=242;doc.setFontSize(10);summary.forEach(([k,v],i)=>{let x=i%2?310:40;if(i%2===0&&i>0)y+=25;doc.setFont('helvetica','normal');doc.setTextColor(145,160,185);doc.text(k,x,y);doc.setFont('helvetica','bold');doc.setTextColor(235,241,250);doc.text(String(v),x+105,y)});
  y+=40;doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text('Attendance records',40,y);y+=22;
  let headers=['Date','In','Out','Worked','OT','Status'];let xs=[40,105,170,245,315,380];doc.setFontSize(8);doc.setTextColor(120,137,160);headers.forEach((h,i)=>doc.text(h,xs[i],y));y+=14;
  records.slice().sort((a,b)=>a.work_date.localeCompare(b.work_date)).forEach(r=>{if(y>790){doc.addPage();doc.setFillColor(11,18,32);doc.rect(0,0,595,842,'F');y=45;headers.forEach((h,i)=>doc.text(h,xs[i],y));y+=14}let h=hours(r.check_in,r.check_out),o=Math.max(0,h-duty);doc.setTextColor(205,214,230);doc.setFont('helvetica','normal');[r.work_date,r.check_in||'-',r.check_out||'-',fmt(h),fmt(o),r.status].forEach((v,i)=>doc.text(String(v),xs[i],y));y+=18});
  doc.setFontSize(8);doc.setTextColor(100,116,140);doc.text('Generated by WorkTrack',40,820);doc.save(`worktrack-${monthKey()}.pdf`);
}
$('exportPdf').onclick=exportPdf;

const reminderKey='worktrack-reminder-settings';
function loadReminderSettings(){
  let saved;try{saved=JSON.parse(localStorage.getItem(reminderKey)||'{}')}catch(e){saved={}}
  $('reminderEnabled').checked=!!saved.enabled;$('reminderTime').value=saved.time||'20:00';
}
function saveReminderSettings(){localStorage.setItem(reminderKey,JSON.stringify({enabled:$('reminderEnabled').checked,time:$('reminderTime').value||'20:00'}));}
async function requestNotifications(){
  if(!('Notification' in window)){alert('This browser does not support notifications.');return}
  let permission=await Notification.requestPermission();
  if(permission==='granted')alert('Notifications enabled for WorkTrack.');
  else alert('Notification permission was not granted. You can enable it from your browser site settings.');
}
function sendReminder(){
  if(records.some(r=>r.work_date===todayKey()))return;
  let msg="You haven't added today's attendance yet.";
  if('Notification' in window&&Notification.permission==='granted')new Notification('WorkTrack reminder',{body:msg});
  else showReminderBanner(msg);
}
function showReminderBanner(msg){
  let existing=$('reminderBanner');if(existing)existing.remove();
  let b=document.createElement('div');b.id='reminderBanner';b.className='reminder-banner';b.innerHTML=`<div><strong>Attendance reminder</strong><span>${msg}</span></div><button type="button">Open</button>`;b.querySelector('button').onclick=()=>{b.remove();openDialog(null,todayKey())};document.body.appendChild(b);setTimeout(()=>b.remove(),12000);
}
function checkReminder(){
  if(!user||!$('reminderEnabled').checked)return;
  let now=new Date(),time=$('reminderTime').value||'20:00',hh=Number(time.slice(0,2)),mm=Number(time.slice(3,5));
  if(now.getHours()===hh&&now.getMinutes()===mm){let stamp=`${todayKey()}-${time}`;if(localStorage.getItem('worktrack-last-reminder')!==stamp){localStorage.setItem('worktrack-last-reminder',stamp);sendReminder()}}
}
$('reminderEnabled').onchange=saveReminderSettings;$('reminderTime').onchange=saveReminderSettings;$('enableNotifications').onclick=requestNotifications;$('testNotification').onclick=()=>{if('Notification' in window&&Notification.permission==='granted')new Notification('WorkTrack test',{body:'Your attendance reminders are working.'});else showReminderBanner('Your reminder preview is working.');};
loadReminderSettings();setInterval(checkReminder,30000);

$('exportCsv').onclick=()=>{let rows=[['Date','Check In','Check Out','Worked Hours','Overtime Hours','Status','Notes'],...records.map(r=>{let h=hours(r.check_in,r.check_out),ot=Math.max(0,h-duty);return[r.work_date,r.check_in||'',r.check_out||'',h.toFixed(2),ot.toFixed(2),r.status,r.notes||'']})];let csv=rows.map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=`worktrack-${monthKey()}.csv`;a.click();URL.revokeObjectURL(a.href)};
setAuthMode();init();
