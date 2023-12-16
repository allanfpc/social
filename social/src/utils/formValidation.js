export default function validateForm(formData, validations) {
    let errors = []
    
    for(const key in validations) {
      if(validations.hasOwnProperty(key)) {
        const validation = validations[key].validation;        
        const name = validations[key].name
        const data = formData[name];
        const { required, pattern: validationPattern, maxLength, minLength } = validation;

        if(required?.value && data.length == 0) {
          errors.push({name, message: required.message})
          continue;
        }
        
        if(minLength && data.length < minLength.value) {
          errors.push({name, message: minLength.message})
          continue;
        }
    
        if(maxLength && data.length > maxLength.value) {
          errors.push({name, message: maxLength.message})
        }

        if(validationPattern) {
          const pattern = new RegExp(validationPattern.value, 'i');
          if(!pattern.test(data)) {        
            errors.push({name, message: validationPattern.message})
            continue;
          }
        }
      }
    }

    if(errors.length > 0) {
      return {errors: errors};
    }

    return true;
}