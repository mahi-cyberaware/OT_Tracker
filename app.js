const SUPABASE_URL="https://qbbbpussyzkutonpvaze.supabase.co";
const SUPABASE_ANON_KEY="sb_publishable_QqqqICyurLbmaMBPUwfF_g_8_jVZYuO";
const REDIRECT_URL="https://ot-tracker-psi.vercel.app/";
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);

let user=null,records=[],month=new Date(),duty=9,signUp=false;
const $=id=>document.getElementById(id);
function fmt(n){return `${Number(n.toFixed(2))}h`}
function hours(inT,outT){if(!inT||!outT)return 0;let [ih,im]=inT.split(':').map(Number),[oh,om]=outT.split(':').map(Number);let a=ih*60+im,b=oh*60+om;if(b<a)b+=1440;return Math.max(0,(b-a)/60)}
function monthKey(){return `${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,'0')}`}
function todayKey(){let d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
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
  $('monthTitle').textContent=month.toLocaleString('en',{month:'long',year:'numeric'});$('monthMeta').textContent=`${records.length} record${records.length===1?'':'s'}`;
  let present=records.filter(x=>x.status==='present'),worked=present.reduce((s,x)=>s+hours(x.check_in,x.check_out),0),ot=present.reduce((s,x)=>s+Math.max(0,hours(x.check_in,x.check_out)-duty),0);
  $('workingDays').textContent=present.length;$('workedHours').textContent=fmt(worked);$('otHours').textContent=fmt(ot);$('regularHours').textContent=fmt(Math.max(0,worked-ot));renderCalendar();renderTable();
}
function renderCalendar(){
  let c=$('calendar');c.innerHTML='';['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(x=>{let d=document.createElement('div');d.className='cal-head';d.textContent=x;c.appendChild(d)});
  let first=new Date(month.getFullYear(),month.getMonth(),1),days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  for(let i=0;i<first.getDay();i++){let d=document.createElement('div');d.className='day mutedday';c.appendChild(d)}
  for(let n=1;n<=days;n++){let date=`${monthKey()}-${String(n).padStart(2,'0')}`,r=records.find(x=>x.work_date===date),d=document.createElement('div');d.className='day'+(date===todayKey()?' today':'');d.innerHTML=`<div class="daynum">${n}</div>`;if(r){let h=hours(r.check_in,r.check_out),ot=Math.max(0,h-duty);d.innerHTML+=`<span class="pill ${ot?'ot':r.status==='present'?'normal':'leave'}">${r.status==='present'?(ot?`+${fmt(ot)} OT`:fmt(h)):r.status}</span>`}d.onclick=()=>openDialog(r,date);c.appendChild(d)}
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
$('exportCsv').onclick=()=>{let rows=[['Date','Check In','Check Out','Worked Hours','Overtime Hours','Status','Notes'],...records.map(r=>{let h=hours(r.check_in,r.check_out),ot=Math.max(0,h-duty);return[r.work_date,r.check_in||'',r.check_out||'',h.toFixed(2),ot.toFixed(2),r.status,r.notes||'']})];let csv=rows.map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=`worktrack-${monthKey()}.csv`;a.click();URL.revokeObjectURL(a.href)};
setAuthMode();init();
