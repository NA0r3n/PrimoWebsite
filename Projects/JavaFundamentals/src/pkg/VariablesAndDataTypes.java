package pkg;

public class VariablesAndDataTypes {
	
	@SuppressWarnings("unused")
	public static void main(String[] args) {
		// char, string, integers(byte,short,int,long), boolean, floating point(float, double)
		
		// Syntax: DataType VarName = Value; or~ DataType Varname;
		
		char Gender = 'M';
		String Name = "Name";
		boolean isKind = true;
		byte Age = 17;
		short PercentileGrade = 304;
		int DateInInt = 6222026;
		long Count = 999999999;
		float stanine = 5f;
		double AverageGradeCombined = 5.00;
		
		System.out.println(stanine + AverageGradeCombined);
		System.out.println("I got a score of: "+PercentileGrade);
	}

}
