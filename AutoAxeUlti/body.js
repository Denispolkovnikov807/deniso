var interval = 0.1
var damage = [250,325,400]
var scepterdamage = [300,425,550]
var manacost = [60,120,180]
var rangeCast = 300
function AxeUltiF(){
if ( !AxeUlti.checked )
		return
	var Me = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var Ulti = Entities.GetAbility(Me, 3)
	var UltiLvl = Abilities.GetLevel(Ulti)
	if(UltiLvl==0)
		return
	if ( Abilities.GetCooldownTimeRemaining(Ulti) != 0 || Entities.GetMana(Me)<manacost[UltiLvl-1] )
		return
	if (!Entities.HasScepter(Me))
		var UltiDmg = damage[UltiLvl-1]
	else
		var UltiDmg = scepterdamage[UltiLvl-1]
	MyPos = Entities.GetAbsOrigin(Me)
	var HEnts = Game.PlayersHeroEnts()
	for (i in HEnts) {
		ent = HEnts[i]
		cast = true
		if(ent==Me)
			continue	
		if ( !Entities.IsEnemy(ent) || !Entities.IsAlive(ent) || Entities.GetAllHeroEntities().indexOf(ent)==-1 )
			continue
		entPos = Entities.GetAbsOrigin(ent)
		if (Game.PointDistance(entPos,MyPos) >  rangeCast) {
			cast = false
		}
		if (cast){
			var HP = Entities.GetHealth(ent)
			if ( HP <= UltiDmg ){
				GameUI.SelectUnit(Me, false);
				Game.CastTarget(Me, Ulti,ent,false)
				$.Msg(HP,'<',UltiDmg)
			}
			cast = false
		}
	}
}
var AxeUltiOnCheckBoxClick = function(){
	if ( !AxeUlti.checked ){
		Game.ScriptLogMsg('Script disabled: AxeUlti', '#ff0000')
		return
	}
	if ( Players.GetPlayerSelectedHero(Game.GetLocalPlayerID()) != 'npc_dota_hero_axe' ){
		AxeUlti.checked = false
		Game.ScriptLogMsg('AxeUlti: Not Axe', '#ff0000')
		return
	}
	function f(){ $.Schedule( interval,function(){
		AxeUltiF()
		if(AxeUlti.checked)
			f()
	})}
	f()
	Game.ScriptLogMsg('Script enabled: AxeUlti', '#00ff00')
}
var Temp = $.CreatePanel( "Panel", $('#scripts'), "AxeUlti" )
Temp.SetPanelEvent( 'onactivate', AxeUltiOnCheckBoxClick )
Temp.BLoadLayoutFromString( '<root><styles><include src="s2r://panorama/styles/dotastyles.vcss_c" /><include src="s2r://panorama/styles/magadan.vcss_c" /></styles><Panel><ToggleButton class="CheckBox" id="AxeUlti" text="AxeUlti"/></Panel></root>', false, false)  
var AxeUlti = $.GetContextPanel().FindChildTraverse( 'AxeUlti' ).Children()[0]
