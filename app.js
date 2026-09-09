const SUPABASE_URL="https://qbbbpussyzkutonpvaze.supabase.co";
const SUPABASE_ANON_KEY="sb_publishable_QqqqICyurLbmaMBPUwfF_g_8_jVZYuO";
const REDIRECT_URL="https://ot-tracker-psi.vercel.app/";
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);

let user=null,records=[],rosterEntries=[],month=new Date(),duty=9,signUp=false,isAdmin=false;
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


/* =========================
   V10 UI + ATTENDANCE TYPES
   ========================= */

const V10_STATUS_OPTIONS=[
  ['present','Present'],
  ['absent','Absent'],
  ['sick_leave','Sick Leave'],
  ['annual_leave','Annual Leave'],
  ['comp_off','Comp-Off'],
  ['off','Day Off'],
  ['holiday','Public Holiday']
];

function ensureV10UI(){

  // Add the new status options without requiring an HTML rewrite.
  let status=$('status');

  if(status){
    status.innerHTML='';
    V10_STATUS_OPTIONS.forEach(([value,label])=>{
      let option=document.createElement('option');
      option.value=value;
      option.textContent=label;
      status.appendChild(option);
    });
  }

  // Add OT reason field beside the existing attendance fields.
  if(status && !$('otReason')){
    let wrap=document.createElement('div');
    wrap.className='field';
    wrap.innerHTML=`
      <label for="otReason">Overtime reason</label>
      <input id="otReason" type="text" maxlength="500"
        placeholder="Why was overtime required?">
      <small class="field-help">Required when overtime is recorded.</small>
    `;
    status.parentElement?.parentElement?.insertAdjacentElement('afterend',wrap);
  }

  // Create a date-details popup dynamically.
  if(!$('dateDetailsDialog')){
    let dialog=document.createElement('dialog');
    dialog.id='dateDetailsDialog';
    dialog.className='glass-dialog';
    dialog.innerHTML=`
      <div class="dialog-card glass-card">
      <div class="dialog-head">
        <div>
          <div class="eyebrow">DATE DETAILS</div>
          <h2 id="dateDetailsTitle">Attendance details</h2>
        </div>
        <button id="closeDateDetails" class="ghost" type="button">Close</button>
      </div>

      <div id="dateDetailsBody" class="details-body"></div>

      <div class="dialog-actions">
        <button id="editDateDetails" class="primary" type="button">Edit attendance</button>
        <button id="closeDateDetailsBottom" class="ghost" type="button">Close</button>
      </div>
      </div>
    `;
    document.body.appendChild(dialog);

    $('closeDateDetails').onclick=()=>dialog.close();
    $('closeDateDetailsBottom').onclick=()=>dialog.close();
    dialog.addEventListener('click',e=>{
      if(e.target===dialog)dialog.close();
    });
  }
}

function statusLabel(status){
  return ({
    present:'Present',
    absent:'Absent',
    sick_leave:'Sick Leave',
    annual_leave:'Annual Leave',
    leave:'Annual Leave',
    comp_off:'Comp-Off',
    off:'Day Off',
    holiday:'Public Holiday'
  })[status]||status||'Unknown';
}

function esc(value){
  return String(value??'')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#039;");
}

function openDateDetails(r,date){

  if(!r){
    openDialog(null,date);
    return;
  }

  let h=
    r.status==='present'?
    hours(r.check_in,r.check_out):
    0;

  let ot=
    r.status==='present'?
    Math.max(0,h-duty):
    0;

  let holiday=
    publicHolidayName(r.work_date);

  $('dateDetailsTitle').textContent=
    new Date(`${r.work_date}T00:00:00`).toLocaleDateString(
      'en',
      {day:'numeric',month:'long',year:'numeric'}
    );

  $('dateDetailsBody').innerHTML=`
    <div class="detail-status">${esc(statusLabel(r.status))}</div>

    ${holiday?`<div class="detail-row"><span>Public holiday</span><b>${esc(holiday)}</b></div>`:''}

    <div class="detail-grid">
      <div class="detail-row"><span>Check-in</span><b>${esc(r.check_in||'-')}</b></div>
      <div class="detail-row"><span>Check-out</span><b>${esc(r.check_out||'-')}</b></div>
      <div class="detail-row"><span>Worked</span><b>${fmt(h)}</b></div>
      <div class="detail-row"><span>Regular</span><b>${fmt(Math.max(0,h-ot))}</b></div>
      <div class="detail-row"><span>Overtime</span><b>${fmt(ot)}</b></div>
    </div>

    ${ot>0?`
      <div class="detail-section">
        <span>Overtime reason</span>
        <p>${esc(r.ot_reason||'No overtime reason added.')}</p>
      </div>
    `:''}

    <div class="detail-section">
      <span>Notes</span>
      <p>${esc(r.notes||'No notes added.')}</p>
    </div>
  `;

  $('editDateDetails').onclick=()=>{
    $('dateDetailsDialog').close();
    openDialog(r);
  };

  $('dateDetailsDialog').showModal();
}

ensureV10UI();


async function load(){
  if(!user)return;
  let p=await sb.from('profiles').select('duty_hours,role').eq('id',user.id).single();
  if(p.data){duty=Number(p.data.duty_hours)||9;isAdmin=p.data.role==='admin';}
  else isAdmin=false;
  updateRosterAdminUI();
  $('dutyHours').value=duty;
  let start=`${monthKey()}-01`,end=new Date(month.getFullYear(),month.getMonth()+1,0).toISOString().slice(0,10);
  let r=await sb.from('attendance').select('*').gte('work_date',start).lte('work_date',end).order('work_date',{ascending:false});
  if(r.error){alert(r.error.message);return}records=r.data||[];await loadRoster();render();
}
function render(){
  $('monthTitle').textContent=month.toLocaleString('en',{month:'long',year:'numeric'});
  $('monthMeta').textContent=`${records.length} record${records.length===1?'':'s'}`;
  let present=records.filter(x=>x.status==='present');
  let worked=present.reduce((sum,x)=>sum+hours(x.check_in,x.check_out),0);
  let ot=present.reduce((sum,x)=>sum+Math.max(0,hours(x.check_in,x.check_out)-duty),0);
  let dayOffCount=records.filter(x=>x.status==='off').length;
  let leaveCount=records.filter(x=>['leave','annual_leave','sick_leave'].includes(x.status)).length;
  let holidayWorkedCount=records.filter(x=>x.status==='present'&&publicHolidayName(x.work_date)).length;
  // V10: monthly attendance is based on elapsed calendar days.
  // Off, leave, comp-off and non-worked public holidays are excluded.
  // Future days are never counted.
  let now=new Date();
  let isCurrentMonth=
    now.getFullYear()===month.getFullYear() &&
    now.getMonth()===month.getMonth();

  let elapsedDays=isCurrentMonth
    ? now.getDate()
    : new Date(month.getFullYear(),month.getMonth()+1,0).getDate();

  let eligibleDays=0;

  for(let day=1;day<=elapsedDays;day++){
    let date=`${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    let record=records.find(x=>x.work_date===date);
    let holiday=publicHolidayName(date);

    if(
      record?.status==='off' ||
      record?.status==='sick_leave' ||
      record?.status==='annual_leave' ||
      record?.status==='comp_off' ||
      record?.status==='leave' ||
      (!record && holiday)
    ){
      continue;
    }

    eligibleDays++;
  }

  let attendanceRate=eligibleDays
    ? Math.round((present.filter(x=>Number(x.work_date.slice(8,10))<=elapsedDays).length/eligibleDays)*100)
    : 0;
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
  for(let n=1;n<=days;n++){let date=`${monthKey()}-${String(n).padStart(2,'0')}`,r=records.find(x=>x.work_date===date),holiday=publicHolidayName(date),d=document.createElement('div');d.className='day'+(date===todayKey()?' today':'')+(holiday?' public-holiday':'');d.innerHTML=`<div class="daynum">${n}</div>`;if(r){let h=hours(r.check_in,r.check_out),ot=Math.max(0,h-duty);d.innerHTML+=`<span class="pill ${ot?'ot':r.status==='present'?(holiday?'holidayworked':'normal'):'leave'}">${r.status==='present'?(ot?`+${fmt(ot)} OT`:fmt(h)):statusLabel(r.status)}</span>`;if(holiday)d.title=`${holiday}${r.status==='present'?' • Worked':''}`}else if(holiday){d.innerHTML+=`<span class="pill holiday">Holiday</span>`;d.title=holiday}d.onclick=()=>openDateDetails(r,date);c.appendChild(d)}
}
function renderTable(){
  let t=$('records');t.innerHTML='';$('emptyRecords').classList.toggle('hidden',records.length>0);
  records.forEach(r=>{let h=hours(r.check_in,r.check_out),ot=Math.max(0,h-duty),tr=document.createElement('tr');tr.innerHTML=`<td>${r.work_date}</td><td>${r.check_in||'-'}</td><td>${r.check_out||'-'}</td><td>${fmt(h)}</td><td><b>${fmt(ot)}</b></td><td class="status ${ot?'ot':r.status==='present'?'normal':'leave'}">${statusLabel(r.status)}</td><td><button class="ghost edit" type="button">Edit</button></td>`;tr.querySelector('.edit').onclick=()=>openDialog(r);t.appendChild(tr)})
}
function openDialog(r,date){
  $('attendanceDialog').showModal();
  $('recordId').value=r?.id||'';
  $('date').value=r?.work_date||date||todayKey();
  $('checkIn').value=r?.check_in||'';
  $('checkOut').value=r?.check_out||'';
  $('status').value=r?.status==='leave'?'annual_leave':(r?.status||'present');
  $('notes').value=r?.notes||'';
  if($('otReason'))$('otReason').value=r?.ot_reason||'';
  $('deleteRecord').classList.toggle('hidden',!r);
  $('dialogTitle').textContent=r?'Edit attendance':'Add attendance';
  updateTimeRequirement();
}
function updateTimeRequirement(){
  let present=$('status').value==='present';
  $('checkIn').required=present;
  $('checkOut').required=present;
  if($('otReason'))$('otReason').required=false;
  $('timeHint').textContent=present
    ?'For Present, both check-in and check-out are required. Add an overtime reason when OT is generated.'
    :'For leave, off, comp-off, absent or public holiday, check-in and check-out can be left blank.';
}
$('status').onchange=updateTimeRequirement;
$('closeDialog').onclick=()=>{$('attendanceDialog').close()};
$('attendanceDialog').addEventListener('click',e=>{if(e.target===$('attendanceDialog'))$('attendanceDialog').close()});
$('attendanceForm').onsubmit=async e=>{
  e.preventDefault();

  let id=$('recordId').value;
  let status=$('status').value;

  if(!$('date').value)
    return alert('Please select a date.');

  if(
    status==='present' &&
    (!$('checkIn').value||!$('checkOut').value)
  )
    return alert('Please enter both check-in and check-out times.');

  let ot=
    status==='present'
      ?Math.max(0,hours($('checkIn').value,$('checkOut').value)-duty)
      :0;

  let otReason=
    $('otReason')?.value.trim()||null;

  if(ot>0&&!otReason)
    return alert('Please enter the reason for the overtime.');

  let obj={
    user_id:user.id,
    work_date:$('date').value,
    check_in:status==='present' ? $('checkIn').value : null,
    check_out:status==='present' ? $('checkOut').value : null,
    break_minutes:0,
    status,
    ot_reason:otReason,
    notes:$('notes').value.trim()||null
  };

  let r=id
    ?await sb.from('attendance').update(obj).eq('id',id).eq('user_id',user.id)
    :await sb.from('attendance').insert(obj);

  if(r.error)
    alert(r.error.message);
  else{
    $('attendanceDialog').close();
    await load();
  }
};
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
  records.slice().sort((a,b)=>a.work_date.localeCompare(b.work_date)).forEach(r=>{if(y>790){doc.addPage();doc.setFillColor(11,18,32);doc.rect(0,0,595,842,'F');y=45;headers.forEach((h,i)=>doc.text(h,xs[i],y));y+=14}let h=hours(r.check_in,r.check_out),o=Math.max(0,h-duty);doc.setTextColor(205,214,230);doc.setFont('helvetica','normal');[r.work_date,r.check_in||'-',r.check_out||'-',fmt(h),fmt(o),statusLabel(r.status)].forEach((v,i)=>doc.text(String(v),xs[i],y));y+=18});
  doc.setFontSize(8);doc.setTextColor(100,116,140);doc.text('Generated by WorkTrack',40,820);doc.save(`worktrack-${monthKey()}.pdf`);
}
$('exportPdf').onclick=exportPdf;


/* =========================
   V17 — PRIVATE DUTY ROSTER
   ========================= */
const rosterSettingsKey='worktrack-roster-settings';
let rosterSettings={enabled:false,time:'20:00',wakeLead:60};
function rosterMessage(text,isError=false){let el=$('rosterMessage');if(!el)return;el.textContent=text||'';el.className=`message ${text?(isError?'error':'success'):''}`}
function normalizeId(v){return String(v??'').trim().replace(/\.0$/,'')}
function parseShift(value){
  if(value===null||value===undefined)return null;let s=String(value).trim().toUpperCase().replace(/\s+/g,'');if(!s)return null;
  if(['OFF','O','AL','SL','S/L','C/O','CO','C/0','HOLIDAY','PH'].includes(s)){let type=s==='OFF'||s==='O'?'off':s==='AL'?'annual_leave':s==='SL'||s==='S/L'?'sick_leave':s==='C/O'||s==='CO'||s==='C/0'?'comp_off':'holiday';return{type,raw:String(value).trim()};}
  let m=s.match(/^(\d{3,4})[-–—](\d{3,4})$/);if(!m)return null;const fix=x=>{x=x.padStart(4,'0');return`${x.slice(0,2)}:${x.slice(2)}`};return{type:'present',start:fix(m[1]),end:fix(m[2]),raw:String(value).trim()};
}
function excelDateToKey(v){
  if(v instanceof Date&&!isNaN(v))return`${v.getFullYear()}-${String(v.getMonth()+1).padStart(2,'0')}-${String(v.getDate()).padStart(2,'0')}`;
  if(typeof v==='number'){let d=new Date(Date.UTC(1899,11,30)+v*86400000);return`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`}
  let s=String(v??'').trim(),m=s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);if(m)return`${m[3]}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;m=s.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);if(m)return`${m[1]}-${String(m[2]).padStart(2,'0')}-${String(m[3]).padStart(2,'0')}`;return'';
}
function findRosterRows(rows,employeeId,employeeName){
  let id=normalizeId(employeeId),wantedName=String(employeeName||'').trim().toLowerCase().replace(/\s+/g,' '),idRow=-1;
  for(let r=0;r<Math.min(rows.length,60);r++){for(let c=0;c<(rows[r]||[]).length;c++){if(id&&normalizeId(rows[r][c])===id){idRow=r;break}}if(idRow>=0)break}
  if(idRow<0&&wantedName){for(let r=0;r<Math.min(rows.length,60);r++){for(let c=0;c<(rows[r]||[]).length;c++){if(String(rows[r][c]??'').trim().toLowerCase().replace(/\s+/g,' ')===wantedName){idRow=r;break}}if(idRow>=0)break}}
  if(idRow<0)return[];
  let dateCols=[];
  for(let r=Math.max(0,idRow-6);r<idRow;r++){let cols=[];for(let c=0;c<(rows[r]||[]).length;c++){let key=excelDateToKey(rows[r][c]);if(key)cols.push([c,key])}if(cols.length>=3)dateCols=cols}
  if(!dateCols.length){
    let titleText=rows.slice(0,14).flat().map(v=>String(v??'')).join(' '),year=(titleText.match(/\b(20\d{2})\b/)||[])[1],monthNo=(titleText.match(/(?:^|\D)(1[0-2]|0?[1-9])\s*\/\s*\d{1,2}\s*\/\s*20\d{2}/)||[])[1];
    if(!monthNo){let mon=(titleText.match(/\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s*20\d{2}/i)||[])[1];let map={JAN:1,FEB:2,MAR:3,APR:4,MAY:5,JUN:6,JUL:7,AUG:8,SEP:9,OCT:10,NOV:11,DEC:12};if(mon&&year)monthNo=map[mon.slice(0,3).toUpperCase()]}
    if(year&&monthNo){let best=null;for(let r=0;r<Math.min(rows.length,30);r++){let cols=[];for(let c=0;c<(rows[r]||[]).length;c++){let n=Number(String(rows[r][c]??'').trim());if(Number.isInteger(n)&&n>=1&&n<=31)cols.push([c,n])}let uniq=[...new Set(cols.map(x=>x[1]))];if(uniq.length>=5&&(!best||uniq.length>best[1]))best=[cols,uniq.length,r]}if(best)dateCols=best[0].map(([c,n])=>[c,`${year}-${String(monthNo).padStart(2,'0')}-${String(n).padStart(2,'0')}`])}
  }
  if(!dateCols.length)return[];let out=[];dateCols.forEach(([c,date])=>{let shift=parseShift(rows[idRow]?.[c]);if(shift)out.push({user_id:user.id,employee_id:id||String(employeeName||''),work_date:date,duty_start:shift.start||null,duty_end:shift.end||null,duty_type:shift.type,raw_duty:shift.raw})});return out;
}
function updateRosterAdminUI(){
  let controls=$('rosterAdminControls'),notice=$('rosterAdminNotice');
  if(controls)controls.classList.toggle('hidden',!isAdmin);
  if(notice){notice.classList.toggle('hidden',isAdmin);notice.textContent='Roster upload is restricted to the WorkTrack administrator. Your account can view only your private roster.';}
}

async function loadRoster(){
  if(!user)return;let r=await sb.from('roster_entries').select('*').eq('user_id',user.id).order('work_date',{ascending:true});if(r.error){rosterEntries=[];return}rosterEntries=r.data||[];try{rosterSettings=JSON.parse(localStorage.getItem(rosterSettingsKey)||'{}')||{}}catch(e){rosterSettings={}}rosterSettings={enabled:!!rosterSettings.enabled,time:rosterSettings.time||'20:00',wakeLead:Number(rosterSettings.wakeLead)||60};if($('dutyReminderEnabled'))$('dutyReminderEnabled').checked=rosterSettings.enabled;if($('dutyReminderTime'))$('dutyReminderTime').value=rosterSettings.time;if($('wakeLead'))$('wakeLead').value=String(rosterSettings.wakeLead);renderRoster();
}
function renderRoster(){let t=$('rosterRecords');if(!t)return;t.innerHTML='';$('emptyRoster').classList.toggle('hidden',rosterEntries.length>0);rosterEntries.forEach(r=>{let tr=document.createElement('tr'),d=new Date(`${r.work_date}T12:00:00`),label=r.duty_type==='present'?`${r.duty_start} – ${r.duty_end}`:statusLabel(r.duty_type==='off'?'off':r.duty_type);tr.innerHTML=`<td>${r.work_date}</td><td>${d.toLocaleDateString('en',{weekday:'short'})}</td><td><b>${esc(label)}</b></td><td class="status ${r.duty_type==='present'?'normal':'leave'}">${esc(r.duty_type==='present'?'Duty':statusLabel(r.duty_type==='off'?'off':r.duty_type))}</td>`;t.appendChild(tr)});updateNextDuty()}
function nextDutyEntry(){let d=new Date();d.setDate(d.getDate()+1);let key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;return rosterEntries.find(r=>r.work_date===key)||null}
function updateNextDuty(){let r=nextDutyEntry();if(!r){setText('nextDutyTitle',rosterEntries.length?'No roster entry for tomorrow':'No roster loaded');setText('nextDutyMeta',rosterEntries.length?'Check your roster or upload the latest version.':'Upload your Excel roster to see tomorrow’s duty.');setText('nextWakeTime','—');setText('wakeMeta','');return}if(r.duty_type!=='present'){setText('nextDutyTitle',statusLabel(r.duty_type==='off'?'off':r.duty_type));setText('nextDutyMeta','No duty reminder is needed for tomorrow.');setText('nextWakeTime','—');setText('wakeMeta','');return}setText('nextDutyTitle',`${r.duty_start} – ${r.duty_end}`);setText('nextDutyMeta','Tomorrow • scheduled duty from your private roster.');let[h,m]=r.duty_start.split(':').map(Number),total=(h*60+m-Number(rosterSettings.wakeLead||60)+1440)%1440;setText('nextWakeTime',`${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`);setText('wakeMeta',`${rosterSettings.wakeLead||60} min before duty`)}
async function importRosterFile(file){if(!file||!user)return;if(!isAdmin){rosterMessage('Only the WorkTrack administrator can upload a roster.',true);return;}if(!window.XLSX){rosterMessage('Excel reader is still loading. Please try again.',true);return}rosterMessage('Reading roster…');try{let buf=await file.arrayBuffer(),wb=XLSX.read(buf,{type:'array',cellDates:true}),all=[];wb.SheetNames.forEach(name=>{let rows=XLSX.utils.sheet_to_json(wb.Sheets[name],{header:1,defval:'',raw:true});all.push(...findRosterRows(rows,profile().employee_id,displayName()))});let unique=new Map();all.forEach(x=>unique.set(x.work_date,x));all=[...unique.values()].sort((a,b)=>a.work_date.localeCompare(b.work_date));if(!all.length){rosterMessage(`Your Employee ID ${profile().employee_id||'(missing)'} (or your profile name) was not found, or no date/shift columns could be read.`,true);return}let del=await sb.from('roster_entries').delete().eq('user_id',user.id);if(del.error){rosterMessage(del.error.message,true);return}let ins=await sb.from('roster_entries').insert(all);if(ins.error){rosterMessage(ins.error.message,true);return}rosterEntries=all;renderRoster();rosterMessage(`Roster imported successfully. ${all.length} duty entries matched your profile.`)}catch(err){rosterMessage(err?.message||'Could not read this roster file.',true)}}
$('rosterFile')?.addEventListener('change',e=>{let f=e.target.files?.[0];if(f)importRosterFile(f);e.target.value=''});$('clearRoster')?.addEventListener('click',async()=>{if(!isAdmin){rosterMessage('Only the WorkTrack administrator can clear a roster.',true);return}if(!user||!confirm('Clear only your private roster?'))return;let r=await sb.from('roster_entries').delete().eq('user_id',user.id);if(r.error)rosterMessage(r.error.message,true);else{rosterEntries=[];renderRoster();rosterMessage('Your private roster was cleared.')}});$('wakeLead')?.addEventListener('change',()=>{rosterSettings.wakeLead=Number($('wakeLead').value)||60;updateNextDuty()});$('saveRosterSettings')?.addEventListener('click',()=>{rosterSettings={enabled:$('dutyReminderEnabled').checked,time:$('dutyReminderTime').value||'20:00',wakeLead:Number($('wakeLead').value)||60};localStorage.setItem(rosterSettingsKey,JSON.stringify(rosterSettings));updateNextDuty();rosterMessage('Roster reminder settings saved.')});
function checkDutyReminder(){if(!user||!rosterSettings.enabled||!rosterEntries.length)return;let now=new Date(),time=rosterSettings.time||'20:00',[hh,mm]=time.split(':').map(Number),current=now.getHours()*60+now.getMinutes(),selected=hh*60+mm;if(current<selected)return;let d=new Date();d.setDate(d.getDate()+1);let key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,r=rosterEntries.find(x=>x.work_date===key);if(!r||r.duty_type!=='present')return;let stamp=`${todayKey()}-${time}-${key}`;if(localStorage.getItem('worktrack-duty-last')===stamp)return;localStorage.setItem('worktrack-duty-last',stamp);let[h,m]=r.duty_start.split(':').map(Number),total=(h*60+m-Number(rosterSettings.wakeLead||60)+1440)%1440,wake=`${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`,msg=`Tomorrow duty: ${r.duty_start}–${r.duty_end}. Wake-up reminder: ${wake}.`;if('Notification'in window&&Notification.permission==='granted'){try{new Notification('WorkTrack — Tomorrow’s duty',{body:msg});return}catch(e){}}showReminderBanner(msg)}
setInterval(checkDutyReminder,30000);

const reminderKey='worktrack-reminder-settings';

function loadReminderSettings(){
  let saved;
  try{
    saved=JSON.parse(localStorage.getItem(reminderKey)||'{}');
  }catch(e){
    saved={};
  }

  $('reminderEnabled').checked=!!saved.enabled;
  $('reminderTime').value=saved.time||'20:00';
  updateNotificationStatus();
}

function saveReminderSettings(){
  localStorage.setItem(
    reminderKey,
    JSON.stringify({
      enabled:$('reminderEnabled').checked,
      time:$('reminderTime').value||'20:00'
    })
  );
}

function updateNotificationStatus(message){
  let el=$('notificationStatus');
  if(!el)return;

  let supported='Notification' in window;
  let permission=supported?Notification.permission:'unsupported';

  if(message){
    el.textContent=message;
    el.dataset.state='info';
    return;
  }

  if(permission==='granted'){
    el.textContent='Notifications are allowed.';
    el.dataset.state='ok';
  }else if(permission==='denied'){
    el.textContent='Notifications are blocked. Enable them in your browser site settings.';
    el.dataset.state='bad';
  }else{
    el.textContent='Notifications are not enabled yet.';
    el.dataset.state='info';
  }
}

async function requestNotifications(){
  if(!('Notification' in window)){
    updateNotificationStatus('This browser does not support notifications.');
    return false;
  }

  try{
    let permission=await Notification.requestPermission();

    if(permission==='granted'){
      updateNotificationStatus('Notifications are enabled.');
      return true;
    }

    updateNotificationStatus(
      permission==='denied'
        ?'Notifications are blocked. Enable them in your browser site settings.'
        :'Notification permission was not granted.'
    );
    return false;
  }catch(err){
    updateNotificationStatus('Could not request notification permission.');
    return false;
  }
}

function sendReminder(force=false){
  if(!force && records.some(r=>r.work_date===todayKey()))return;

  let msg="You haven't added today's attendance yet.";

  if(
    'Notification' in window &&
    Notification.permission==='granted'
  ){
    try{
      new Notification('WorkTrack reminder',{body:msg});
      updateNotificationStatus('Test/reminder notification sent.');
      return;
    }catch(e){}
  }

  showReminderBanner(msg);
  updateNotificationStatus(
    force
      ?'Test shown inside WorkTrack because browser notifications are not enabled.'
      :'Reminder shown inside WorkTrack.'
  );
}

function showReminderBanner(msg){
  let existing=$('reminderBanner');
  if(existing)existing.remove();

  let b=document.createElement('div');
  b.id='reminderBanner';
  b.className='reminder-banner';

  b.innerHTML=`
    <div>
      <strong>Attendance reminder</strong>
      <span>${esc(msg)}</span>
    </div>
    <button type="button">Add attendance</button>
  `;

  b.querySelector('button').onclick=()=>{
    b.remove();
    openDialog(null,todayKey());
  };

  document.body.appendChild(b);

  setTimeout(()=>b.remove(),12000);
}

function checkReminder(){
  if(!user||!$('reminderEnabled').checked)return;

  let now=new Date();
  let time=$('reminderTime').value||'20:00';
  let parts=time.split(':');
  let hh=Number(parts[0]);
  let mm=Number(parts[1]);

  // Trigger any time after the selected minute, once per day.
  let currentMinutes=now.getHours()*60+now.getMinutes();
  let selectedMinutes=hh*60+mm;

  if(currentMinutes<selectedMinutes)return;

  let stamp=`${todayKey()}-${time}`;

  if(localStorage.getItem('worktrack-last-reminder')===stamp)return;

  localStorage.setItem('worktrack-last-reminder',stamp);
  sendReminder(false);
}

$('reminderEnabled').onchange=async()=>{
  saveReminderSettings();

  if($('reminderEnabled').checked){
    await requestNotifications();
  }else{
    updateNotificationStatus('Daily reminder is turned off.');
  }
};

$('reminderTime').onchange=()=>{
  saveReminderSettings();
  updateNotificationStatus('Reminder time saved.');
};

$('enableNotifications').onclick=requestNotifications;

$('testNotification').onclick=()=>{
  sendReminder(true);
};

loadReminderSettings();
setInterval(checkReminder,30000);

$('homeLogo')?.addEventListener('click',()=>showAppSection('home'));

$('exportCsv').onclick=()=>{let rows=[['Date','Check In','Check Out','Worked Hours','Overtime Hours','Status','OT Reason','Notes'],...records.map(r=>{let h=hours(r.check_in,r.check_out),ot=Math.max(0,h-duty);return[r.work_date,r.check_in||'',r.check_out||'',h.toFixed(2),ot.toFixed(2),statusLabel(r.status),r.ot_reason||'',r.notes||'']})];let csv=rows.map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=`worktrack-${monthKey()}.csv`;a.click();URL.revokeObjectURL(a.href)};
setAuthMode();init();

/* =========================
   V11 — APP MENU + FOOTER
   ========================= */

const appSections={
  home:['homeSection','homeStats'],
  roster:['rosterSection'],
  calendar:['calendarSection'],
  analytics:['analyticsSection'],
  reports:['reportsSection'],
  records:['recordsSection'],
  payroll:['payrollSection'],
  reminders:['remindersSection'],
  settings:['settingsSection']
};

const navLabels={
  home:'Home',
  roster:'My Roster',
  calendar:'Calendar',
  analytics:'Analytics',
  reports:'Reports',
  records:'Attendance history',
  payroll:'Payroll estimate',
  reminders:'Reminders',
  settings:'Settings'
};

function closeAppMenu(){
  let menu=$('appMenu');
  if(!menu)return;
  menu.classList.remove('open');
  menu.setAttribute('aria-hidden','true');
  $('menuButton')?.setAttribute('aria-expanded','false');
}

function openAppMenu(){
  let menu=$('appMenu');
  if(!menu)return;
  menu.classList.add('open');
  menu.setAttribute('aria-hidden','false');
  $('menuButton')?.setAttribute('aria-expanded','true');
}

function showAppSection(name){

  Object.values(appSections).flat().forEach(id=>{
    let el=$(id);
    if(el)el.classList.add('menu-hidden-section');
  });

  let ids=appSections[name]||appSections.home;
  ids.forEach(id=>{
    let el=$(id);
    if(el)el.classList.remove('menu-hidden-section');
  });

  document.querySelectorAll('.menu-item[data-nav]').forEach(btn=>{
    btn.classList.toggle('active',btn.dataset.nav===name);
  });

  closeAppMenu();

  window.scrollTo({top:0,behavior:'smooth'});
}

function showInfo(type){

  let title='';
  let kicker='';
  let body='';

  if(type==='about'){
    kicker='ABOUT MAHI';
    title='About the creator';
    body=`
      <div class="info-highlight">
        <strong>Mahi</strong>
        <span>Creator of WorkTrack</span>
      </div>
      <p>Mahi is an Operations Officer who built WorkTrack as a simple, practical tool for managing attendance, working hours and overtime.</p>
      <p>The goal is straightforward: keep work records organized, make overtime easier to understand, and give employees a clean private workspace.</p>
    `;
  }

  if(type==='contact'){
    kicker='CONTACT';
    title='Contact Mahi';
    body=`
      <div class="contact-list">
        <a href="mailto:myprogrammwork1@gmail.com"><span>Email</span><strong>myprogrammwork1@gmail.com</strong></a>
        <a href="tel:+971507635453"><span>Contact</span><strong>+971 50 763 5453</strong></a>
        <a href="https://github.com/mahi-cyberaware" target="_blank" rel="noopener noreferrer"><span>GitHub</span><strong>mahi_cyberaware</strong></a>
      </div>
    `;
  }

  if(type==='security'){
    kicker='SECURITY & PRIVACY';
    title='Your data & security';
    body=`
      <div class="security-list">
        <div><strong>🔐 Account authentication</strong><span>Sign-in is handled through Supabase Authentication.</span></div>
        <div><strong>🛡️ Private records</strong><span>WorkTrack uses Row Level Security so attendance records are intended to be accessible only to the authenticated account.</span></div>
        <div><strong>🔑 Browser-safe key</strong><span>The app uses a Supabase publishable key. Never place a Supabase secret/service-role key in browser code.</span></div>
        <div><strong>🌐 Secure connection</strong><span>Use the HTTPS WorkTrack address and keep your account password private.</span></div>
        <div><strong>⚠️ Good practice</strong><span>Do not share your login credentials, and always sign out on shared devices.</span></div>
      </div>
    `;
  }

  $('infoKicker').textContent=kicker;
  $('infoTitle').textContent=title;
  $('infoBody').innerHTML=body;
  $('infoDialog').showModal();
}

$('menuButton')?.addEventListener('click',openAppMenu);
$('closeMenu')?.addEventListener('click',closeAppMenu);
$('menuBackdrop')?.addEventListener('click',closeAppMenu);
$('menuLogout')?.addEventListener('click',async()=>{
  closeAppMenu();
  await sb.auth.signOut();
});

document.querySelectorAll('[data-nav]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    let target=btn.dataset.nav;

    if(target==='profile'){
      closeAppMenu();
      openProfile();
      return;
    }

    if(['about','contact','security'].includes(target)){
      closeAppMenu();
      showInfo(target);
      return;
    }

    showAppSection(target);
  });
});

$('closeInfo')?.addEventListener('click',()=>$('infoDialog').close());
$('closeInfoBottom')?.addEventListener('click',()=>$('infoDialog').close());
$('infoDialog')?.addEventListener('click',e=>{
  if(e.target===$('infoDialog'))$('infoDialog').close();
});

// Home is the quiet default view; other sections are opened from the menu.
showAppSection('home');



/* =========================
   V15 — SECURE CHANGE PASSWORD
   ========================= */

let passwordVerificationMode='current';
let passwordVerificationEmail='';

function resetPasswordDialog(){
  passwordVerificationMode='current';
  passwordVerificationEmail=user?.email||'';

  ['passwordStepCurrent','passwordStepOtp','passwordStepNew'].forEach(id=>{
    $(id)?.classList.add('hidden');
  });

  $('passwordStepCurrent')?.classList.remove('hidden');

  ['currentPassword','passwordOtp','newPassword','confirmPassword'].forEach(id=>{
    if($(id))$(id).value='';
  });

  ['passwordCurrentMessage','otpMessage','passwordMessage'].forEach(id=>{
    if($(id)){
      $(id).textContent='';
      $(id).className='message';
    }
  });
}

function openPasswordDialog(){
  if(!$('passwordDialog'))return;
  resetPasswordDialog();
  $('passwordDialog').showModal();
}

function closePasswordDialog(){
  if($('passwordDialog')?.open)$('passwordDialog').close();
}

function showPasswordStep(step){
  ['passwordStepCurrent','passwordStepOtp','passwordStepNew'].forEach(id=>{
    $(id)?.classList.toggle('hidden',id!==step);
  });
}

function setPasswordMessage(id,text,isError=false){
  if(!$(id))return;
  $(id).textContent=text||'';
  $(id).className=`message ${text?(isError?'error':'success'):''}`;
}

function setupPasswordToggle(buttonId,inputId){
  $(buttonId)?.addEventListener('click',()=>{
    let input=$(inputId);
    let visible=input.type==='text';
    input.type=visible?'password':'text';
    $(buttonId).textContent=visible?'Show':'Hide';
  });
}

// Logged-in user: verify the old password first.
$('passwordForm')?.addEventListener('submit',async e=>{
  e.preventDefault();

  let currentPassword=$('currentPassword').value;

  if(!currentPassword){
    setPasswordMessage('passwordCurrentMessage','Enter your current password.',true);
    return;
  }

  $('verifyCurrentPassword').disabled=true;
  setPasswordMessage('passwordCurrentMessage','Verifying current password…');

  try{
    let email=user?.email;

    if(!email){
      setPasswordMessage('passwordCurrentMessage','Your account email could not be found. Please sign in again.',true);
      return;
    }

    // Re-authenticate the account using the current password.
    let result=await sb.auth.signInWithPassword({
      email,
      password:currentPassword
    });

    if(result.error){
      setPasswordMessage('passwordCurrentMessage','Current password is incorrect.',true);
      return;
    }

    passwordVerificationMode='current';
    showPasswordStep('passwordStepNew');
  }catch(err){
    setPasswordMessage(
      'passwordCurrentMessage',
      err?.message||'Could not verify your current password.',
      true
    );
  }finally{
    $('verifyCurrentPassword').disabled=false;
  }
});

// Forgot current password: send an email OTP.
$('forgotPasswordButton')?.addEventListener('click',async()=>{
  let email=user?.email;

  if(!email){
    setPasswordMessage('passwordCurrentMessage','Your account email could not be found.',true);
    return;
  }

  $('forgotPasswordButton').disabled=true;
  setPasswordMessage('passwordCurrentMessage','Sending verification OTP…');

  try{
    let result=await sb.auth.signInWithOtp({
      email,
      options:{
        shouldCreateUser:false
      }
    });

    if(result.error){
      setPasswordMessage('passwordCurrentMessage',result.error.message,true);
      return;
    }

    passwordVerificationMode='otp';
    passwordVerificationEmail=email;
    showPasswordStep('passwordStepOtp');
    setPasswordMessage('otpMessage',`OTP sent to ${email}.`);
  }catch(err){
    setPasswordMessage(
      'passwordCurrentMessage',
      err?.message||'Could not send the OTP.',
      true
    );
  }finally{
    $('forgotPasswordButton').disabled=false;
  }
});

// Verify email OTP.
$('otpForm')?.addEventListener('submit',async e=>{
  e.preventDefault();

  let token=$('passwordOtp').value.trim();

  if(!/^\d{6,8}$/.test(token)){
    setPasswordMessage('otpMessage','Enter the OTP from your email.',true);
    return;
  }

  $('verifyOtpButton').disabled=true;
  setPasswordMessage('otpMessage','Verifying OTP…');

  try{
    let result=await sb.auth.verifyOtp({
      email:passwordVerificationEmail,
      token,
      type:'email'
    });

    if(result.error){
      setPasswordMessage('otpMessage',result.error.message,true);
      return;
    }

    passwordVerificationMode='otp';
    showPasswordStep('passwordStepNew');
  }catch(err){
    setPasswordMessage(
      'otpMessage',
      err?.message||'Invalid or expired OTP.',
      true
    );
  }finally{
    $('verifyOtpButton').disabled=false;
  }
});

// Set the new password after either current-password or OTP verification.
$('newPasswordForm')?.addEventListener('submit',async e=>{
  e.preventDefault();

  let password=$('newPassword').value;
  let confirm=$('confirmPassword').value;

  if(password.length<6){
    setPasswordMessage('passwordMessage','Password must be at least 6 characters.',true);
    return;
  }

  if(password!==confirm){
    setPasswordMessage('passwordMessage','Passwords do not match.',true);
    return;
  }

  $('savePassword').disabled=true;
  setPasswordMessage('passwordMessage','Updating password…');

  try{
    let result=await sb.auth.updateUser({password});

    if(result.error){
      setPasswordMessage('passwordMessage',result.error.message,true);
      return;
    }

    setPasswordMessage('passwordMessage','Password changed successfully.');

    setTimeout(()=>{
      closePasswordDialog();
    },1000);
  }catch(err){
    setPasswordMessage(
      'passwordMessage',
      err?.message||'Could not change your password.',
      true
    );
  }finally{
    $('savePassword').disabled=false;
  }
});

$('closePassword')?.addEventListener('click',closePasswordDialog);
$('cancelPassword')?.addEventListener('click',closePasswordDialog);
$('cancelOtp')?.addEventListener('click',closePasswordDialog);
$('cancelNewPassword')?.addEventListener('click',closePasswordDialog);

$('passwordDialog')?.addEventListener('click',e=>{
  if(e.target===$('passwordDialog'))closePasswordDialog();
});

setupPasswordToggle('toggleCurrentPassword','currentPassword');
setupPasswordToggle('toggleNewPassword','newPassword');
setupPasswordToggle('toggleConfirmPassword','confirmPassword');

$('settingsPasswordButton')?.addEventListener('click',openPasswordDialog);



/* =========================
   V16 — HOME EXPERIENCE
   ========================= */

let v16InsightIndex=0;
let v16InsightTimer=null;

function v16Greeting(){
  let h=new Date().getHours();
  if(h<12)return 'Good morning';
  if(h<17)return 'Good afternoon';
  if(h<22)return 'Good evening';
  return 'Good night';
}

function v16FmtMinutes(minutes){
  minutes=Math.max(0,Math.round(minutes||0));
  let hh=Math.floor(minutes/60);
  let mm=minutes%60;
  return `${hh}h ${String(mm).padStart(2,'0')}m`;
}

function v16SetInsights(){
  let track=$('insightTrack');
  if(!track)return;

  track.style.transform=`translateX(-${v16InsightIndex*100}%)`;

  document.querySelectorAll('#insightDots button').forEach((b,i)=>{
    b.classList.toggle('active',i===v16InsightIndex);
  });
}

function v16StartSlider(){
  document.querySelectorAll('#insightDots button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      v16InsightIndex=Number(btn.dataset.slide)||0;
      v16SetInsights();
      clearInterval(v16InsightTimer);
      v16InsightTimer=setInterval(()=>{
        v16InsightIndex=(v16InsightIndex+1)%4;
        v16SetInsights();
      },5500);
    });
  });

  clearInterval(v16InsightTimer);
  v16InsightTimer=setInterval(()=>{
    v16InsightIndex=(v16InsightIndex+1)%4;
    v16SetInsights();
  },5500);
}

function v16UpdateLiveTime(){
  let el=$('homeLiveTime');
  if(el){
    el.textContent=new Date().toLocaleTimeString([],{
      hour:'2-digit',
      minute:'2-digit'
    });
  }
}

function v16UpdateHomeFromRecords(records=[]){

  let now=new Date();
  let key=todayKey();
  let current=records.find(r=>r.work_date===key);

  if($('homeGreeting')){
    let name=user?.user_metadata?.first_name||user?.user_metadata?.name||'there';
    $('homeGreeting').textContent=`${v16Greeting()}, ${name} 👋`;
  }

  let todayDate=new Date(`${key}T00:00:00`);
  if($('todayWorkDate')){
    $('todayWorkDate').textContent=todayDate.toLocaleDateString('en',{
      weekday:'long',
      day:'numeric',
      month:'long'
    });
  }

  if(current){
    let worked=current.status==='present'
      ?hours(current.check_in,current.check_out)
      :0;
    let ot=current.status==='present'
      ?Math.max(0,worked-duty)
      :0;

    if($('todayWorkBadge')){
      $('todayWorkBadge').textContent=statusLabel(current.status);
      $('todayWorkBadge').classList.add('recorded');
    }

    if($('todayCheckIn'))$('todayCheckIn').textContent=current.check_in||'—';
    if($('todayCheckOut'))$('todayCheckOut').textContent=current.check_out||'—';
    if($('todayWorked'))$('todayWorked').textContent=v16FmtMinutes(worked*60);
    if($('todayOt'))$('todayOt').textContent=v16FmtMinutes(ot*60);
    if($('todayDuty'))$('todayDuty').textContent=v16FmtMinutes(duty*60);

    if($('insightToday')){
      $('insightToday').textContent=
        current.status==='present'
          ?`${v16FmtMinutes(worked*60)} worked`
          :statusLabel(current.status);
    }
    if($('insightTodaySub')){
      $('insightTodaySub').textContent=
        current.status==='present'
          ?`${current.check_in||'—'} → ${current.check_out||'—'}`
          :(current.notes||'Today is recorded.');
    }
    if($('homeLiveStatus'))$('homeLiveStatus').textContent=statusLabel(current.status);
  }else{
    if($('todayWorkBadge')){
      $('todayWorkBadge').textContent='Not recorded';
      $('todayWorkBadge').classList.remove('recorded');
    }
    if($('todayCheckIn'))$('todayCheckIn').textContent='—';
    if($('todayCheckOut'))$('todayCheckOut').textContent='—';
    if($('todayWorked'))$('todayWorked').textContent='0h 00m';
    if($('todayOt'))$('todayOt').textContent='0h 00m';
    if($('todayDuty'))$('todayDuty').textContent=v16FmtMinutes(duty*60);
    if($('insightToday'))$('insightToday').textContent='No attendance yet';
    if($('insightTodaySub'))$('insightTodaySub').textContent='Add your attendance for today.';
    if($('homeLiveStatus'))$('homeLiveStatus').textContent='Ready';
  }

  let monthKey=key.slice(0,7);
  let monthRecords=records.filter(r=>r.work_date.startsWith(monthKey));

  let present=monthRecords.filter(r=>r.status==='present');
  let totalOt=present.reduce((sum,r)=>{
    let worked=hours(r.check_in,r.check_out);
    return sum+Math.max(0,worked-duty);
  },0);

  // Reuse the same monthly eligibility rules as the dashboard.
  let monthDate=new Date(`${monthKey}-01T00:00:00`);
  let elapsedDays=now.getDate();
  let eligible=0;

  for(let day=1;day<=elapsedDays;day++){
    let date=`${monthKey}-${String(day).padStart(2,'0')}`;
    let record=monthRecords.find(r=>r.work_date===date);
    let holiday=publicHolidayName(date);

    if(
      record?.status==='off' ||
      record?.status==='sick_leave' ||
      record?.status==='annual_leave' ||
      record?.status==='comp_off' ||
      record?.status==='leave' ||
      (!record&&holiday)
    )continue;

    eligible++;
  }

  let attendance=eligible
    ?Math.round((present.filter(r=>Number(r.work_date.slice(8,10))<=elapsedDays).length/eligible)*100)
    :0;

  if($('insightOt'))$('insightOt').textContent=v16FmtMinutes(totalOt*60);
  if($('insightAttendance'))$('insightAttendance').textContent=`${attendance}%`;
  if($('insightDays'))$('insightDays').textContent=present.length;
}

$('homeAddAttendance')?.addEventListener('click',()=>{
  openDialog(null,todayKey());
});

$('homeOpenCalendar')?.addEventListener('click',()=>{
  showAppSection('calendar');
});

document.querySelectorAll('[data-home-nav]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    showAppSection(btn.dataset.homeNav);
  });
});

v16StartSlider();
v16UpdateLiveTime();
setInterval(v16UpdateLiveTime,30000);


const v16OriginalLoad=load;
load=async function(){
  let result=await v16OriginalLoad.apply(this,arguments);
  try{
    // Query the current month records for the home showcase. This is read-only.
    let {data}=await sb.from('attendance')
      .select('*')
      .eq('user_id',user.id)
      .order('work_date',{ascending:true});

    v16UpdateHomeFromRecords(data||[]);
  }catch(e){
    console.warn('Home showcase refresh:',e);
  }
  return result;
};

setTimeout(()=>{
  try{
    if(typeof user!=='undefined'&&user)v16UpdateHomeFromRecords([]);
  }catch(e){}
},250);
