package pkg;

public class MethodsorFunctions {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		sayHello();
		
		double numbers[] = {123,234,356,456,567};
		
		System.out.print(summation(numbers));
	}
	
	/* modifier returntype methodname(arguments){
		returntypevar = value;
		return returntypevar;
	
	}
		
		#overloading(same func.method different parameters)
	
	*/
	public static void sayHello() {
		System.out.println("Hello");
	}

	public static int summation(double numbers[]) {
		double sum = 0;
	
		for(double number: numbers) {
		sum = sum + number;
	}
	
		return (int) sum;
	}
}

