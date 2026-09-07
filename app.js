const SUPABASE_URL="https://qbbbpussyzkutonpvaze.supabase.co";
const SUPABASE_ANON_KEY="sb_publishable_QqqqICyurLbmaMBPUwfF_g_8_jVZYuO";
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);

let user=null,records=[],month=new Date(),duty=9,signUp=false;
const $=id=>document.getElementById(id);
function fmt(n){return `${Number(n.toFixed(2))}h`}
function hours(inT,outT){if(!inT||!outT)return 0;let [ih,im]=inT.split(':').map(Number),[oh,om]=outT.split(':').map(Number);let a=ih*60+im,b=oh*60+om;if(b<a)b+=1440;return Math.max(0,(b-a)/60)}
function monthKey(){return `${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,'0')}`}
function todayKey(){return new Date().toISOString().slice(0,10)}

async function init(){
  const {data:{session}}=await sb.auth.getSession();
  if(session){user=session.user;showApp();await load()}else showAuth();
  sb.auth.onAuthStateChange((_e,s)=>{if(s){user=s.user;showApp();load()}else{user=null;showAuth()}})
}
function showAuth(){$('authView').classList.remove('hidden');$('appView').classList.add('hidden')}
function showApp(){$('authView').classList.add('hidden');$('appView').classList.remove('hidden');$('userEmail').textContent=user?.email||''}
function authMessage(text,isError=false){$('authMessage').textContent=text;$('authMessage').style.color=isError?'#b42318':'#3159c7'}

$('toggleAuth').onclick=()=>{signUp=!signUp;$('authSubmit').textContent=signUp?'Create account':'Sign in';$('toggleAuth').textContent=signUp?'Already have an account? Sign in':'Create an account';$('password').autocomplete=signUp?'new-password':'current-password';authMessage('')}
$('authForm').onsubmit=async e=>{
  e.preventDefault();authMessage('');
  let email=$('email').value.trim(),password=$('password').value;
  let r=signUp?await sb.auth.signUp({email,password,options:{emailRedirectTo:'https://ot-tracker-psi.vercel.app/'}}):await sb.auth.signInWithPassword({email,password});
  if(r.error)authMessage(r.error.message,true);
  else if(signUp)authMessage('Account created. Check your email to confirm your account.');
}
$('logout').onclick=()=>sb.auth.signOut();

async function load(){
  if(!user)return;
  let p=await sb.from('profiles').select('duty_hours').eq('id',user.id).single();
  if(p.data)duty=Number(p.data.duty_hours)||9;
  $('dutyHours').value=duty;
  let start=`${monthKey()}-01`,end=new Date(month.getFullYear(),month.getMonth()+1,0).toISOString().slice(0,10);
  let r=await sb.from('attendance').select('*').gte('work_date',start).lte('work_date',end).order('work_date',{ascending:false});
  if(r.error){alert(r.error.message);return}
  records=r.data||[];render();
}
function render(){
  let title=month.toLocaleString('en',{month:'long',year:'numeric'});$('monthTitle').textContent=title;
  $('monthMeta').textContent=`${records.length} record${records.length===1?'':'s'}`;
  let present=records.filter(x=>x.status==='present'),worked=present.reduce((s,x)=>s+hours(x.check_in,x.check_out),0),ot=present.reduce((s,x)=>s+Math.max(0,hours(x.check_in,x.check_out)-duty),0);
  $('workingDays').textContent=present.length;$('workedHours').textContent=fmt(worked);$('otHours').textContent=fmt(ot);$('regularHours').textContent=fmt(Math.max(0,worked-ot));
  renderCalendar();renderTable();
}
function renderCalendar(){
  let c=$('calendar');c.innerHTML='';['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(x=>{let d=document.createElement('div');d.className='cal-head';d.textContent=x;c.appendChild(d)});
  let first=new Date(month.getFullYear(),month.getMonth(),1),days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  for(let i=0;i<first.getDay();i++){let d=document.createElement('div');d.className='day mutedday';c.appendChild(d)}
  for(let n=1;n<=days;n++){
    let date=`${monthKey()}-${String(n).padStart(2,'0')}`,r=records.find(x=>x.work_date===date),d=document.createElement('div');d.className='day'+(date===todayKey()?' today':'');d.innerHTML=`<div class="daynum">${n}</div>`;
    if(r){let h=hours(r.check_in,r.check_out),ot=Math.max(0,h-duty);d.innerHTML+=`<span class="pill ${ot?'ot':r.status==='present'?'normal':'leave'}">${r.status==='present'?(ot?`+${fmt(ot)} OT`:fmt(h)):r.status}`</span>`}
    d.onclick=()=>openDialog(r,date);c.appendChild(d)
  }
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
$('attendanceForm').onsubmit=async e=>{
  e.preventDefault();let id=$('recordId').value,status=$('status').value;
  if(status==='present'&&(!$('checkIn').value||!$('checkOut').value))return alert('Please enter both check-in and check-out times.');
  let obj={user_id:user.id,work_date:$('date').value,check_in:status==='present'?$('checkIn').value:null,check_out:status==='present'?$('checkOut').value:null,break_minutes:0,status,notes:$('notes').value.trim()||null};
  let r=id?await sb.from('attendance').update(obj).eq('id',id).eq('user_id',user.id):await sb.from('attendance').insert(obj);
  if(r.error)alert(r.error.message);else{$('attendanceDialog').close();await load()}
}
$('deleteRecord').onclick=async()=>{let id=$('recordId').value;if(id&&confirm('Delete this attendance record?')){let r=await sb.from('attendance').delete().eq('id',id).eq('user_id',user.id);if(r.error)alert(r.error.message);else{$('attendanceDialog').close();await load()}}}
$('addToday').onclick=()=>openDialog(null,todayKey());
$('prevMonth').onclick=()=>{month=new Date(month.getFullYear(),month.getMonth()-1,1);load()}
$('nextMonth').onclick=()=>{month=new Date(month.getFullYear(),month.getMonth()+1,1);load()}
$('todayMonth').onclick=()=>{let t=new Date();month=new Date(t.getFullYear(),t.getMonth(),1);load()}
$('saveSettings').onclick=async()=>{let v=Number($('dutyHours').value);if(v<=0||v>24)return alert('Enter duty hours between 0.25 and 24.');let r=await sb.from('profiles').upsert({id:user.id,duty_hours:v});if(r.error)alert(r.error.message);else{duty=v;render();alert('Settings saved.')}}
$('exportCsv').onclick=()=>{let rows=[['Date','Check In','Check Out','Worked Hours','Overtime Hours','Status','Notes'],...records.map(r=>{let h=hours(r.check_in,r.check_out),ot=Math.max(0,h-duty);return[r.work_date,r.check_in||'',r.check_out||'',h.toFixed(2),ot.toFixed(2),r.status,r.notes||'']})];let csv=rows.map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=`worktrack-${monthKey()}.csv`;a.click();URL.revokeObjectURL(a.href)}
init();
