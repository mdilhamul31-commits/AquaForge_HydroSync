/**
 * HYDROSYNC Authoritative Irrigation Logic & Interlocks
 * Sourced directly from Stage 4 firmware specification:
 * https://github.com/ayankunduixb-pixel/AquaForge-HYDROSYNC-Smart-IoT-Based-Irrigation-and-Monitoring-System
 * 
 * Control Thresholds & Hysteresis:
 * 1. Soil moisture pump ON: <= 30.0%
 * 2. Soil moisture pump OFF: >= 45.0% (Hysteresis prevents relay oscillation)
 * 3. Tank lockout: < 15.0% (Forced immediate shutdown)
 * 4. Tank lockout recovery: >= 20.0% (Hysteresis prevents relay chatter during filling)
 * 5. Debounce: 40 ms
 * 6. Relay polarity: Active-High (RELAY_ACTIVE_LOW = false)
 */

export interface IrrigationDecision {
  pumpOn: boolean;
  lowTankWarning: boolean;
  tankLockout: boolean;
  soilCondition: 'DRY' | 'MODERATE' | 'MOIST';
  tankStatus: 'LOW' | 'NORMAL' | 'FULL';
  systemStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'LOCKOUT';
  reason: string;
}

export const SOIL_ON_THRESHOLD = 30.0;       // <= 30% triggers pump ON
export const SOIL_OFF_THRESHOLD = 45.0;      // >= 45% triggers pump OFF
export const TANK_LOCKOUT_THRESHOLD = 15.0;  // < 15% trips safety lockout
export const TANK_RECOVERY_THRESHOLD = 20.0; // >= 20% clears safety lockout

// Aliases
export const SOIL_DRY_THRESHOLD = SOIL_ON_THRESHOLD;
export const TANK_MINIMUM_LEVEL = TANK_LOCKOUT_THRESHOLD;


export function evaluateIrrigationLogic(
  soilMoisture: number,
  tankLevel: number,
  mode: 'AUTO' | 'MANUAL' = 'AUTO',
  manualRequest: boolean = false,
  previousPumpState: boolean = false,
  previousLockoutState: boolean = false
): IrrigationDecision {
  // 1. Tank Lockout Hysteresis
  let tankLockout = previousLockoutState;
  if (tankLevel < TANK_LOCKOUT_THRESHOLD) {
    tankLockout = true;
  } else if (tankLevel >= TANK_RECOVERY_THRESHOLD) {
    tankLockout = false;
  }

  const lowTankWarning = tankLockout || (tankLevel < TANK_RECOVERY_THRESHOLD);

  let soilCondition: 'DRY' | 'MODERATE' | 'MOIST' = 'MODERATE';
  if (soilMoisture <= SOIL_ON_THRESHOLD) {
    soilCondition = 'DRY';
  } else if (soilMoisture >= SOIL_OFF_THRESHOLD) {
    soilCondition = 'MOIST';
  }

  let tankStatus: 'LOW' | 'NORMAL' | 'FULL' = 'NORMAL';
  if (tankLevel < TANK_LOCKOUT_THRESHOLD) {
    tankStatus = 'LOW';
  } else if (tankLevel >= 85) {
    tankStatus = 'FULL';
  }

  // Absolute safety interlock: if lockout is active, pump is forced OFF
  if (tankLockout) {
    return {
      pumpOn: false,
      lowTankWarning: true,
      tankLockout: true,
      soilCondition,
      tankStatus,
      systemStatus: 'LOCKOUT',
      reason: `Tank level (${tankLevel.toFixed(1)}%) < ${TANK_LOCKOUT_THRESHOLD}%. Safety interlock active. Recovery requires >= ${TANK_RECOVERY_THRESHOLD}%.`
    };
  }

  // 2. Pump Decision with Soil Hysteresis
  let pumpOn = previousPumpState;
  let reason = '';

  if (mode === 'AUTO') {
    if (soilMoisture <= SOIL_ON_THRESHOLD) {
      pumpOn = true;
      reason = `Soil moisture (${soilMoisture.toFixed(1)}%) <= ${SOIL_ON_THRESHOLD}%. Automated irrigation demand ACTIVE. Target: ${SOIL_OFF_THRESHOLD}%.`;
    } else if (soilMoisture >= SOIL_OFF_THRESHOLD) {
      pumpOn = false;
      reason = `Soil moisture (${soilMoisture.toFixed(1)}%) reached ${SOIL_OFF_THRESHOLD}% cutoff. Pump returned to standby.`;
    } else {
      // In hysteresis band (30% to 45%)
      reason = pumpOn
        ? `Soil moisture in irrigation cycle (${soilMoisture.toFixed(1)}%). Pump running until ${SOIL_OFF_THRESHOLD}%.`
        : `Soil moisture in deadband (${soilMoisture.toFixed(1)}%). Pump standby until <= ${SOIL_ON_THRESHOLD}%.`;
    }
  } else {
    // MANUAL Mode
    if (manualRequest) {
      pumpOn = true;
      reason = `Manual override switch (GPIO14) active. Tank level safe (${tankLevel.toFixed(1)}%). Pump manual RUN.`;
    } else {
      pumpOn = false;
      reason = 'Manual mode engaged. Pump idle awaiting operator command.';
    }
  }

  const systemStatus = lowTankWarning ? 'WARNING' : 'NORMAL';

  return {
    pumpOn,
    lowTankWarning,
    tankLockout,
    soilCondition,
    tankStatus,
    systemStatus,
    reason
  };
}
