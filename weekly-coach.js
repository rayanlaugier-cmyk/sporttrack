// SportTrack Weekly Coach integration
// Loads/generates the weekly AI report after Monday 10:00 (Europe/Paris).
(function(){
  let weeklyCoachReport = null;
  let weeklyCoachLoading = false;

  function parisNow(){
    return new Date(new Date().toLocaleString('en-US',{timeZone:'Europe/Paris'}));
  }

  function isWeeklyCoachDue(){
    const now=parisNow();
    const day=now.getDay();
    return day>1 || (day===1 && now.getHours()>=10);
  }

  function decisionLabel(value){
    return ({maintain:'Maintenir',increase:'Augmenter',decrease:'Réduire',monitor:'Surveiller'})[value]||'Surveiller';
  }

  function safeText(value){
    try{return typeof escapeHtml==='function'?escapeHtml(value):String(value??'');}
    catch{return String(value??'');}
  }

  function renderWeeklyCoach(report){
    if(!report) return;
    const box=document.getElementById('automaticReport');
    if(!box) return;
    const rec=Number(report.recommended_calories)||Number(data?.calorieGoal)||0;
    const confidence=Number(report.confidence)||0;
    const reeval=report.reevaluate_on ? new Date(report.reevaluate_on+'T12:00:00').toLocaleDateString('fr-FR') : '-';
    const minimumWeeks=Math.max(1,Number(report.minimum_weeks)||1);
    box.innerHTML=`
      <div class="report-block">
        <div class="report-status status-good">Coach IA · bilan hebdomadaire</div>
        <h3>Analyse multi-semaines</h3>
        <p>${safeText(report.report_text||'')}</p>
      </div>
      <div class="report-block">
        <div class="report-status status-info">Plan actuel</div>
        <h3>${decisionLabel(report.decision)}${rec?` · ${rec} kcal`:''}</h3>
        <p>Durée minimale recommandée : ${minimumWeeks} semaine${minimumWeeks>1?'s':''}. Réévaluation prévue : ${reeval}. Confiance : ${confidence}%.</p>
      </div>`;
    const updated=document.getElementById('reportUpdatedAt');
    if(updated) updated.textContent=`Coach IA · semaine du ${new Date(report.week_start+'T12:00:00').toLocaleDateString('fr-FR')}`;
  }

  async function loadLatestWeeklyCoachReport(){
    if(typeof currentUser==='undefined' || !currentUser || typeof supabaseClient==='undefined' || !supabaseClient) return null;
    const {data:row,error}=await supabaseClient.from('weekly_coach_reports')
      .select('*').eq('user_id',currentUser.id).order('week_start',{ascending:false}).limit(1).maybeSingle();
    if(error){ console.warn('Weekly coach load error',error); return null; }
    weeklyCoachReport=row||null;
    if(weeklyCoachReport) renderWeeklyCoach(weeklyCoachReport);
    return weeklyCoachReport;
  }

  async function generateWeeklyCoachReport(){
    if(weeklyCoachLoading || typeof currentUser==='undefined' || !currentUser || typeof supabaseClient==='undefined' || !supabaseClient || !isWeeklyCoachDue()) return;
    weeklyCoachLoading=true;
    const updated=document.getElementById('reportUpdatedAt');
    try{
      if(updated) updated.textContent='Coach IA · analyse en cours…';
      const {data:response,error}=await supabaseClient.functions.invoke('weekly-coach-report',{body:{source:'dashboard'}});
      if(error) throw error;
      if(response?.needs_openai_key){
        if(updated) updated.textContent='Coach IA prêt · clé OpenAI requise';
        return;
      }
      if(response?.report){ weeklyCoachReport=response.report; renderWeeklyCoach(response.report); }
    }catch(err){
      console.warn('Weekly coach generation error',err);
      if(updated) updated.textContent='Coach IA · erreur temporaire';
    } finally{weeklyCoachLoading=false;}
  }

  async function refreshWeeklyCoach(){
    await loadLatestWeeklyCoachReport();
    if(isWeeklyCoachDue()) await generateWeeklyCoachReport();
  }

  window.refreshWeeklyCoach=refreshWeeklyCoach;
  window.renderWeeklyCoach=renderWeeklyCoach;
  document.addEventListener('visibilitychange',()=>{if(!document.hidden) refreshWeeklyCoach();});
  window.addEventListener('focus',refreshWeeklyCoach);
  setTimeout(refreshWeeklyCoach,2500);
})();
