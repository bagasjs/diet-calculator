const sexInputNode = document.getElementById("sex-input");
const ageInputNode = document.getElementById("age-input");
const heightInputNode = document.getElementById("height-input");
const weightInputNode = document.getElementById("weight-input");
const targetWeightInputNode = document.getElementById("target-weight-input");
const calculateButton = document.getElementById("calculate-button");
const activityFactorInputNode = document.getElementById("activity-factor-input");
const targetCalorieDeficitInputNode = document.getElementById("target-calorie-deficit-input");
const summaryNode = document.getElementById("summary");

/**
 * A person's required information for diet calculation
 * @typedef {Object} Profile
 * @property {boolean} isMale - Is the person male or female
 * @property {number} height - The height of the person must be an integer
 * @property {number} age - The age of the person must be an integer
 * @property {number} weight - The weight of the person must be an integer
 * @property {string} activityFactorLabel - The activity factor label of a person
 */

/**
 * @constructor
 * @param {boolean} isMale
 * @param {number} age
 * @param {number} weight
 * @param {number} height 
 * @param {string} activityFactorLabel
 */
function Profile(isMale, age, weight, height, activityFactorLabel) {
    this.isMale = isMale;
    this.age = age;
    this.weight = weight;
    this.height = height;
    this.heightInMeter = height/100;
    this.heightInMeterSqr = this.heightInMeter*this.heightInMeter;
    this.activityFactorLabel = activityFactorLabel;

    this.activityFactorConstant = 0;
    this.activityFactorDescription = "";
    switch(activityFactorLabel) {
        case "sedentary":
            this.activityFactorConstant = 1.2;
            this.activityFactorDescription = "Minimal physical activity, mostly sitting";
            break;
        case "lightly_active":
            this.activityFactorConstant = 1.375;
            this.activityFactorDescription = "Light exercise or activity 1-3 days a week";
            break;
        case "moderately_active":
            this.activityFactorConstant = 1.55;
            this.activityFactorDescription = "Moderate exercise or activity 3-5 days a week";
            break;
        case "very_active":
            this.activityFactorConstant = 1.725;
            this.activityFactorDescription = "Intense exercise or activity 6-7 days a week";
            break;
        case "extra_active":
            this.activityFactorConstant = 1.9;
            this.activityFactorDescription = "Highly demanding physical work or intense training";
            break;
    }

    this.idealBodyWeight = this.isMale ? 
        50 + (0.91 * (this.height - 152.4)) :
        45.5 + (0.91 * (this.height - 152.4)) ;

    const bmr = (isMale, age, height, weight) => isMale ? 
        10 * weight + 6.25 * height - 5 * age + 5 : 
        10 * weight + 6.25 * height - 5 * age - 161;

    /**
     * dailyCalorieNeed is calculated using TDEE
     */
    this.dailyCalorieNeed = bmr(this.isMale, this.age, this.height, this.weight) * this.activityFactorConstant;

    this.bmi = this.weight / this.heightInMeterSqr;
    this.weightCategory = undefined;
    if(this.bmi < 18.5) {
        this.weightCategory = "underweight";
    } else if(18.5 <= this.bmi && this.bmi < 25) {
        this.weightCategory = "normal";
    } else if(25 <= this.bmi && this.bmi < 30) {
        this.weightCategory = "overweight";
    } else if (this.bmi > 30) {
        this.weightCategory = "obesity";
    }

    this.normalWeightMin = this.heightInMeterSqr*18.5;
    this.normalWeightMax = this.heightInMeterSqr*24.9;
}

/**
 * @param {number} currentWeight
 * @param {number} targetWeight
 * @param {number} calorieDeficitPerDay
 * @return {number}
 */
const calculateDayToReduceWeightBasedOnCalorieIntake = (currentWeight, targetWeight, calorieDeficitPerDay) => {
    return ((currentWeight - targetWeight) * 7700) / calorieDeficitPerDay;
}

calculateButton.addEventListener("click", () => {
    const sex = sexInputNode.value;
    const age = parseInt(ageInputNode.value);
    const height = parseInt(heightInputNode.value);
    const weight = parseInt(weightInputNode.value);
    const targetWeight = parseInt(targetWeightInputNode.value);
    const calorieDeficit = parseInt(targetCalorieDeficitInputNode.value);
    const activityFactorLabel = activityFactorInputNode.value;
    let isMale = false;
    if(sex == "male") {
        isMale = true;
    } else if(sex == "female") {
        isMale = false;
    } else {
        summaryNode.innerText = "What the hell?";
    }
    const current = new Profile(isMale, age, weight, height, activityFactorLabel);

    let summary = `Based on BMI, your weight are <strong>${current.weightCategory}</strong>. The normal weight for your body profile is within <strong>${current.normalWeightMin.toFixed(1)} - ${current.normalWeightMax.toFixed(1)}</strong> or the precise number is <strong>${current.idealBodyWeight.toFixed(1)}</strong> (using the common method for calculating IBW). The difference is around <strong>${Math.abs(current.idealBodyWeight-current.weight).toFixed(1)} kg</strong>. `
    if(current.weightCategory == "normal") {
        summary += `With that in mind if you want to maintain your current weight you need to consume <strong>${current.dailyCalorieNeed} kcal/day</strong>. `
        if(current.weight > current.idealBodyWeight) {
            summary += `Although, with the same activity factor "(${current.activityFactorDescription})", it's recommended for you to reduce your calorie intake by ${calorieDeficit} kcal/day for <strong>${calculateDayToReduceWeightBasedOnCalorieIntake(current.weight, current.idealBodyWeight, calorieDeficit).toFixed(1)} day(s) </strong> to reduce your weight by <strong>${Math.abs(current.weight - current.idealBodyWeight).toFixed(1)} kg</strong> or your ideal weight. `
        }
    }
    if(current.normalWeightMin <= targetWeight && targetWeight <= current.normalWeightMax && current.weight > targetWeight) {
        summary += `Given that you has target weight of ${targetWeight} then you will need to reduce your calorie intake by ${calorieDeficit} kcal/day for <strong>${calculateDayToReduceWeightBasedOnCalorieIntake(current.weight, targetWeight, calorieDeficit).toFixed(1)} day(s)</strong>.`
    }
    summaryNode.innerHTML = summary;
});

