// SportTrack Weekly Coach integration
// Generates/loads the weekly AI report after Monday 10:00 (Europe/Paris).
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

  function renderWeeklyCoach(report){
    if(!report) return;
    const box=document.getElementById('automaticReport');
    if(!box) return;
    const rec=Number(report.recommended_calories)||Number(window.data?.calorieGoal)||0;
    const confidence=Number(report.confidence)||0;
    const reeval=report.reevaluate_on ? new Date(report.reevaluate_on+'T12:00:00').toLocaleDateString('fr-FR') : '-';
    box.innerHTML=`
      <div class="report-block">
        <div class="report-status status-good">Coach IA · bilan hebdomadaire</div>
        <h3>Analyse multi-semaines</h3>
        <p>${window.escapeHtml?window.escapeHtml(report.report_text||''):report.report_text||''}</p>
      </div>
      <div class="report-block">
        <div class="report-status status-info">Plan actuel</div>
        <h3>${decisionLabel(report.decision)}${rec?` · ${rec} kcal`:''}</h3>
        <p>Durée minimale recommandée : ${Math.max(1,Number(report.minimum_weeks)||1)} semaine(s). Réévaluation prévue : ${reeval}. Confiance : ${confidence}%.</p>
      </div>`;
    const updated=document.getElementById('reportUpdatedAt');
    if(updated) updated.textContent=`Coach IA · semaine du ${new Date(report.week_start+'T12:00:00').toLocaleDateString('fr-FR')}`;
  }

  async function loadLatestWeeklyCoachReport(){
    if(!window.currentUser || !window.supabaseClient) return null;
    const {data,error}=await window.supabaseClient.from('weekly_coach_reports')
      .select('*').eq('user_id',window.currentUser.id).order('week_start',{ascending:false}).limit(1).maybeSingle();
    if(error){ console.warn('Weekly coach load error',error); return null; }
    weeklyCoachReport=data||null;
    if(weeklyCoachReport) renderWeeklyCoach(weeklyCoachReport);
    return weeklyCoachReport;
  }

  async function generateWeeklyCoachReport(){
    if(weeklyCoachLoading || !window.currentUser || !window.supabaseClient || !isWeeklyCoachDue()) return;
    weeklyCoachLoading=true;
    try{
      const {data,error}=await window.supabaseClient.functions.invoke('weekly-coach-report',{body:{source:'dashboard'}});
      if(error) throw error;
      if(data?.needs_openai_key){
        const updated=document.getElementById('reportUpdatedAt');
        if(updated) updated.textContent='Coach IA prêt · clé OpenAI requise';
        return;
      }
      if(data?.report){ weeklyCoachReport=data.report; renderWeeklyCoach(data.report); }
    }catch(err){ console.warn('Weekly coach generation error',err); }
    finally{ weeklyCoachLoading=false; }
  }

  async function refreshWeeklyCoach(){
    await loadLatestWeeklyCoachReport();
    if(isWeeklyCoachDue()) await generateWeeklyCoachReport();
  }

  window.refreshWeeklyCoach=refreshWeeklyCoach;
  window.renderWeeklyCoach=renderWeeklyCoach;
  window.addEventListener('sporttrack-authenticated',refreshWeeklyCoach);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden) refreshWeeklyCoach();});
  window.addEventListener('focus',refreshWeeklyCoach);
  setTimeout(refreshWeeklyCoach,2500);
})();